// Builds and downloads an IGCSE Paper 1 practice paper as a Microsoft Word (.docx).
// Page 1 = one random 4, 6, and 10-marker for the chosen focus unit.
// Page 2 = the matching mark schemes (rendered as tables that mirror the site).

import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, PageBreak,
} from 'docx';

const TYPES = ['4_marker', '6_marker', '10_marker'];
const LABELS = { '4_marker': '4-marker', '6_marker': '6-marker', '10_marker': '10-marker' };

const stripHtml = (html) =>
  String(html || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

const pickRandom = (arr) => (arr.length ? arr[Math.floor(Math.random() * arr.length)] : null);

// Convert rich cell HTML into docx Paragraphs, mirroring the site's prose-archive
// rendering: <p>/<div> become paragraphs, <strong>/<b> become bold runs, <br>
// becomes a line break, and <ul>/<ol> become bulleted/numbered list paragraphs.
function htmlToParagraphs(html, forceBold = false) {
  const container = document.createElement('div');
  container.innerHTML = String(html || '').replace(/&nbsp;/g, ' ');

  const run = (text, fmt = {}) => new TextRun({
    text,
    bold: forceBold || !!fmt.bold,
    italics: !!fmt.italic,
    underline: fmt.underline ? {} : undefined,
  });

  const collectInline = (node, fmt, runs) => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const t = child.textContent;
        if (t) runs.push(run(t, fmt));
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const tag = child.tagName.toLowerCase();
        if (tag === 'br') {
          runs.push(new TextRun({ break: 1 }));
        } else if (tag === 'strong' || tag === 'b') {
          collectInline(child, { ...fmt, bold: true }, runs);
        } else if (tag === 'em' || tag === 'i') {
          collectInline(child, { ...fmt, italic: true }, runs);
        } else if (tag === 'u' || tag === 'a') {
          collectInline(child, { ...fmt, underline: true }, runs);
        } else {
          collectInline(child, fmt, runs);
        }
      }
    });
  };

  const paragraphs = [];
  const block = (node, bullet) => {
    const runs = [];
    collectInline(node, {}, runs);
    if (runs.length) paragraphs.push(new Paragraph({ children: runs, bullet }));
  };

  let olCounter = 0;
  container.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent;
      if (t && t.trim()) paragraphs.push(new Paragraph({ children: [run(t)] }));
      return;
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return;
    const tag = node.tagName.toLowerCase();
    if (tag === 'ul') {
      node.childNodes.forEach((li) => {
        if (li.nodeType === Node.ELEMENT_NODE && li.tagName.toLowerCase() === 'li') {
          block(li, { level: 0 });
        }
      });
    } else if (tag === 'ol') {
      node.childNodes.forEach((li) => {
        if (li.nodeType === Node.ELEMENT_NODE && li.tagName.toLowerCase() === 'li') {
          const runs = [];
          collectInline(li, {}, runs);
          if (runs.length) paragraphs.push(new Paragraph({ children: [run(`${olCounter + 1}. `), ...runs] }));
          olCounter += 1;
        }
      });
    } else {
      block(node);
    }
  });

  if (!paragraphs.length) paragraphs.push(new Paragraph({ children: [run('')] }));
  return paragraphs;
}

function buildTable(rows) {
  const cols = rows[0]?.length || 1;
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((row, ri) =>
      new TableRow({
        children: Array.from({ length: cols }, (_, c) =>
          new TableCell({
            children: htmlToParagraphs(row[c], ri === 0),
          })
        ),
      })
    ),
  });
}

export async function generatePaperDoc(topic, items) {
  const byType = { '4_marker': [], '6_marker': [], '10_marker': [] };
  items.forEach((it) => {
    if (it.category === 'question' && byType[it.question_type] && (it.topic || '') === topic) {
      byType[it.question_type].push(it);
    }
  });
  const picked = {
    '4_marker': pickRandom(byType['4_marker']),
    '6_marker': pickRandom(byType['6_marker']),
    '10_marker': pickRandom(byType['10_marker']),
  };

  const children = [];
  // ---- Page 1: questions ----
  children.push(new Paragraph({
    children: [new TextRun({ text: 'IGCSE History — Paper 1', bold: true, size: 32 })],
    spacing: { after: 80 },
  }));
  children.push(new Paragraph({
    children: [new TextRun({ text: `Focus unit: ${topic}`, italics: true, size: 22 })],
    spacing: { after: 240 },
  }));

  TYPES.forEach((type) => {
    const q = picked[type];
    children.push(new Paragraph({
      children: [new TextRun({ text: `${LABELS[type]}`, bold: true, size: 24 })],
      spacing: { before: 200, after: 80 },
    }));
    children.push(new Paragraph({
      children: [new TextRun({
        text: q ? stripHtml(q.question) : `No ${LABELS[type]} available for this focus unit.`,
      })],
    }));
  });

  // ---- Page 2: mark schemes ----
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(new Paragraph({
    children: [new TextRun({ text: 'Mark schemes', bold: true, size: 32 })],
    spacing: { after: 200 },
  }));

  TYPES.forEach((type) => {
    const q = picked[type];
    children.push(new Paragraph({
      children: [new TextRun({ text: `${LABELS[type]}`, bold: true, size: 24 })],
      spacing: { before: 200, after: 80 },
    }));
    if (q && q.question) {
      children.push(new Paragraph({
        children: [new TextRun({ text: stripHtml(q.question), italics: true })],
        spacing: { after: 120 },
      }));
    }
    if (q && q.mark_scheme_rows && q.mark_scheme_rows.length) {
      children.push(buildTable(q.mark_scheme_rows));
    } else {
      children.push(new Paragraph({ children: [new TextRun({ text: 'No mark scheme available.' })] }));
    }
  });

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Paper1_${topic.replace(/\s+/g, '_')}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return picked;
}