// Fill-the-gap questions made from the teacher's own revision notes, with no extra work from her.
// A sentence is taken from the notes, one important item in it is blanked out (a key word, a bolded
// phrase, a name, a year or a figure) and the student chooses what goes in the gap. The wrong
// options are the same kind of item taken from elsewhere in the same unit's notes.

const GAP = '_____';
const WORD = '[\\p{L}\\p{N}]';
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
const tidy = (s) => String(s || '').replace(/[ \s]+/g, ' ').trim();
const wordCount = (s) => s.split(' ').filter(Boolean).length;

const shuffled = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

// Names and titles: "Hitler", "Treaty of Versailles", "Night of the Long Knives", "USSR".
const NAME_RE = /\p{Lu}[\p{L}\p{N}'’-]*(?:(?:\s+(?:of|the|de|von|van|der|du|la|le|al|bin|ibn|zu))*\s+\p{Lu}[\p{L}\p{N}'’-]*)*/gu;
const YEAR_RE = /(?<![\p{L}\p{N},.])(?:1[0-9]{3}|20[0-9]{2})(?![\p{L}\p{N}]|[,.]\d)/gu;
const NUMBER_RE = /(?<![\p{L}\p{N},.])(?:\d{1,3}(?:,\d{3})+|\d+(?:\.\d+)?)(?:%| (?:million|billion|thousand))?(?![\p{L}\p{N}]|[,.]\d)/gu;
const isYear = (s) => /^(?:1[0-9]{3}|20[0-9]{2})$/.test(s);
// capitalised words that are not worth a question on their own
const DULL = new Set(['i', 'the', 'a', 'an', 'in', 'on', 'at', 'by', 'it', 'he', 'she', 'they', 'we', 'this', 'that', 'these', 'those', 'however', 'therefore',
  'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december',
  'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday', 'source', 'paper', 'figure', 'page', 'chapter']);

// The notes as separate passages (a paragraph, a bullet point, a table cell), each with the phrases the teacher put in bold.
function passages(blocks) {
  const out = [];
  if (typeof DOMParser === 'undefined') return out;
  const read = (html) => {
    if (!html) return;
    const root = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html').body.firstChild;
    const parts = [...root.querySelectorAll('p, li, blockquote, td')].filter((el) => !el.querySelector('p, li, blockquote, td'));
    (parts.length ? parts : [root]).forEach((el) => {
      const text = tidy(el.textContent);
      if (!text) return;
      const bold = [...el.querySelectorAll('strong, b')].map((b) => tidy(b.textContent).replace(/[.,;:!?]+$/, '')).filter(Boolean);
      out.push({ text, bold });
    });
  };
  blocks.forEach((b) => {
    if (!b.kind || b.kind === 'text') read(b.html);
    // a two-column table is already quizzed as matching pairs; wider tables hold sentences worth using
    if (b.kind === 'table' && b.rows?.[0]?.length > 2) b.rows.slice(1).forEach((row) => row.forEach((cell) => read(`<p>${cell}</p>`)));
  });
  return out;
}

const sentencesOf = (text) => text.split(/(?<=[.!?]["”’)]?)\s+(?=["“‘(]?\p{Lu})/u).map(tidy).filter(Boolean);

// Up to three wrong options, as close in shape to the answer as the notes allow (one word for one word, and so on).
function wrongOptions(answer, pool, avoid) {
  const seen = new Set([norm(answer)]);
  const length = wordCount(answer);
  const ranked = shuffled(pool)
    .filter((o) => {
      const key = norm(o);
      if (!key || seen.has(key) || avoid.includes(key) || key.includes(norm(answer)) || norm(answer).includes(key)) return false;
      seen.add(key);
      return true;
    })
    .map((o) => ({ o, gap: Math.abs(wordCount(o) - length) }))
    .sort((a, b) => a.gap - b.gap);
  return ranked.slice(0, 3).map((r) => r.o);
}

const nearYears = (year, taken) => {
  const y = Number(year);
  return shuffled([-10, -5, -3, -2, -1, 1, 2, 3, 5, 10]).map((d) => String(y + d)).filter((v) => !taken.includes(v));
};

// Other believable figures when the notes hold too few: half, double and so on, written the same way as the answer.
const nearNumbers = (answer) => {
  const m = answer.match(/^([\d,]+)(%| (?:million|billion|thousand))?$/);
  if (!m) return [];
  const value = Number(m[1].replace(/,/g, ''));
  if (!value) return [];
  const commas = m[1].includes(',');
  return shuffled([0.5, 0.75, 1.5, 2, 3])
    .map((f) => Math.max(1, Math.round(value * f)))
    .filter((v) => v !== value && !(m[2] === '%' && v > 100))
    .map((v) => `${commas ? v.toLocaleString('en-GB') : v}${m[2] || ''}`);
};

/**
 * blocks = the unit's content blocks; terms = its key words ({ title, meaning, chinese });
 * spareTitles = key words from elsewhere, used only to fill out the options.
 * Returns questions shaped like the rest of the quiz, plus `sentence` so one sentence is asked only once per quiz.
 */
export function buildGapQuestions(blocks, terms = [], spareTitles = []) {
  const parts = passages(blocks);
  if (!parts.length) return [];

  const termTitles = terms.map((t) => tidy(t.title)).filter(Boolean).sort((a, b) => b.length - a.length);
  const termRe = (title) => new RegExp(`(?<!${WORD})${escapeRe(title)}(?=(?:s|es)?(?!${WORD}))`, 'giu');
  const isTerm = (s) => termTitles.some((t) => norm(t) === norm(s));

  // everything in the notes that could fill a gap, by kind, so wrong options come from the same unit
  const sentences = [];
  const pool = { name: new Set(), year: new Set(), number: new Set(), term: new Set() };
  const midSentence = new Set(); // names seen away from the start of a sentence, where the capital letter means something
  parts.forEach((part) => {
    sentencesOf(part.text).forEach((text) => {
      sentences.push({ text, bold: part.bold.filter((b) => text.includes(b)) });
      for (const m of text.matchAll(NAME_RE)) if (m.index > 0) midSentence.add(norm(m[0]));
      for (const m of text.matchAll(YEAR_RE)) pool.year.add(m[0]);
      for (const m of text.matchAll(NUMBER_RE)) if (!isYear(m[0])) pool.number.add(m[0]);
      termTitles.forEach((t) => { if (termRe(t).test(text)) pool.term.add(t); });
    });
  });
  const usable = (s) => s.length >= 3 && s.length <= 45 && wordCount(s) <= 5 && !DULL.has(norm(s));
  sentences.forEach(({ text, bold }) => {
    for (const m of text.matchAll(NAME_RE)) if ((m.index > 0 || midSentence.has(norm(m[0]))) && usable(m[0])) pool.name.add(m[0]);
    bold.forEach((b) => { if (usable(b) && !isYear(b) && !isTerm(b)) pool.name.add(b); });
  });

  const questions = [];
  sentences.forEach(({ text, bold }, id) => {
    const words = wordCount(text);
    if (words < 7 || words > 45 || /\?$/.test(text)) return;

    // what could be blanked in this sentence: [answer, kind, how much it matters]
    const found = new Map();
    const add = (answer, kind, weight) => {
      const key = norm(answer);
      if (!key || (found.has(key) && found.get(key).weight >= weight)) return;
      found.set(key, { answer, kind, weight });
    };
    termTitles.forEach((t) => { if (termRe(t).test(text)) add(t, 'term', 3); });
    for (const m of text.matchAll(NAME_RE)) {
      if ((m.index > 0 || midSentence.has(norm(m[0]))) && usable(m[0]) && !isTerm(m[0])) add(m[0], 'name', 2);
    }
    for (const m of text.matchAll(YEAR_RE)) add(m[0], 'year', 2);
    for (const m of text.matchAll(NUMBER_RE)) if (!isYear(m[0])) add(m[0], 'number', 1);
    bold.forEach((b) => {
      if (isTerm(b)) return;
      if (isYear(b)) add(b, 'year', 3);
      else if (usable(b)) add(b, 'name', 3);
    });

    const inSentence = [...found.keys()];
    const ranked = shuffled([...found.values()]).sort((a, b) => b.weight - a.weight).slice(0, 2);
    ranked.forEach(({ answer, kind }) => {
      const blank = kind === 'term' ? termRe(answer) : new RegExp(`(?<!${WORD})${escapeRe(answer)}(?!${WORD})`, 'gu');
      const stem = text.replace(blank, GAP);
      if (stem === text || wordCount(stem.replaceAll(GAP, '')) < 5) return;

      let wrong;
      if (kind === 'year') {
        wrong = wrongOptions(answer, [...pool.year], inSentence);
        if (wrong.length < 3) wrong = [...wrong, ...nearYears(answer, [answer, ...wrong, ...inSentence])].slice(0, 3);
      } else if (kind === 'number') {
        const suffix = (s) => (s.match(/(%| (?:million|billion|thousand))$/) || [''])[0];
        // only figures of a similar size from the notes: "100,000" next to "15" gives the answer away
        const digits = (n) => n.replace(/\D/g, '').length;
        const alike = (n) => suffix(n) === suffix(answer) && Math.abs(digits(n) - digits(answer)) <= 1;
        wrong = wrongOptions(answer, [...pool.number].filter(alike), inSentence);
        if (wrong.length < 3) wrong = [...wrong, ...nearNumbers(answer).filter((n) => !wrong.includes(n) && !inSentence.includes(norm(n)))].slice(0, 3);
      } else if (kind === 'term') {
        wrong = wrongOptions(answer, [...pool.term, ...termTitles, ...spareTitles], inSentence);
      } else {
        wrong = wrongOptions(answer, [...pool.name], inSentence);
      }
      if (wrong.length < 2) return;

      questions.push({
        label: 'From the notes', prompt: 'Choose what fills the gap', stem, answer,
        options: shuffled([answer, ...wrong]), note: '', sentence: id, full: text,
      });
    });
  });
  return questions;
}
