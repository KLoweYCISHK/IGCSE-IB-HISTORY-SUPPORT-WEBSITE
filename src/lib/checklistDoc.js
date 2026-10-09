// Builds and downloads a final-submission checklist as a Microsoft Word (.docx).
// Each item is prefixed with an empty checkbox glyph so students can tick it off.

import { Document, Packer, Paragraph, TextRun } from 'docx';

const stripHtml = (html) =>
  String(html || '')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

export async function generateChecklistDoc(title, items) {
  const children = [
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 32 })],
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Tick each box before you submit.', italics: true, size: 20 })],
      spacing: { after: 280 },
    }),
  ];

  items.forEach((it) => {
    const text = stripHtml(it.text);
    if (!text) return;
    children.push(new Paragraph({
      children: [new TextRun({ text: `\u2610  ${text}` })],
      spacing: { after: 140 },
    }));
  });

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${String(title).replace(/\s+/g, '_')}_checklist.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}