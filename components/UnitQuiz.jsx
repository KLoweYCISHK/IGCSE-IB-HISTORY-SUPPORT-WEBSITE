import React, { useState } from 'react';
import { store } from '@/api/firebaseClient';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Check, X, RotateCcw, ListChecks } from 'lucide-react';

const shuffled = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};
const plain = (html) => String(html || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const same = (a, b) => a.trim().toLowerCase() === b.trim().toLowerCase();

// One right answer plus up to three different wrong ones, in a random order.
const withOptions = (answer, others) => {
  const wrong = [];
  shuffled(others).forEach((o) => { if (o && !same(o, answer) && !wrong.some((w) => same(w, o)) && wrong.length < 3) wrong.push(o); });
  return wrong.length >= 2 ? shuffled([answer, ...wrong]) : null;
};

// Builds multiple-choice questions from what is already in a unit's revision notes:
// the key words that appear in the notes, and any two-column table (term and meaning, date and event).
function buildQuestions(blocks, terms) {
  const questions = [];
  const text = blocks.map((b) => [b.title, plain(b.html), ...(b.rows || []).flat().map(plain)].join(' ')).join(' ');
  const defined = terms.filter((t) => t.title?.trim() && (t.meaning?.trim() || t.chinese?.trim()));
  const meaningOf = (t) => (t.meaning?.trim() || t.chinese.trim());
  const used = defined.filter((t) => new RegExp(`(?<![\\p{L}\\p{N}])${escapeRe(t.title.trim())}`, 'iu').test(text));

  used.forEach((t, i) => {
    const note = t.meaning?.trim() && t.chinese?.trim() ? t.chinese.trim() : '';
    // spare key words from the rest of the site fill the options when a unit has only a few of its own
    const others = [...used.filter((o) => o.id !== t.id), ...defined.filter((o) => !used.includes(o))];
    if (i % 2 === 0) {
      const options = withOptions(t.title.trim(), others.map((o) => o.title.trim()));
      if (options) questions.push({ label: 'Key word', prompt: 'Which key word matches this meaning?', stem: meaningOf(t), answer: t.title.trim(), options, note });
    } else {
      const options = withOptions(meaningOf(t), others.map(meaningOf));
      if (options) questions.push({ label: 'Key word', prompt: 'What does this key word mean?', stem: t.title.trim(), answer: meaningOf(t), options, note });
    }
  });

  blocks.filter((b) => b.kind === 'table' && b.rows?.length >= 4 && b.rows[0].length === 2).forEach((b) => {
    const head = b.rows[0].map(plain);
    const rows = b.rows.slice(1).map((r) => r.map(plain)).filter((r) => r[0] && r[1]);
    rows.forEach((r) => {
      const options = withOptions(r[1], rows.map((o) => o[1]));
      if (options) questions.push({ label: b.title || 'From the notes', prompt: head[0] && head[1] ? `${head[0]}: choose the matching ${head[1].toLowerCase()}` : 'Choose the match', stem: r[0], answer: r[1], options, note: '' });
    });
  });
  return questions;
}

// "Quiz me" for one focus unit or topic. sections = that unit's revision subsections.
export default function UnitQuiz({ page, sections, title }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [all, setAll] = useState([]);
  const [quiz, setQuiz] = useState([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [missed, setMissed] = useState([]);

  const begin = (pool) => { setQuiz(shuffled(pool).slice(0, 10)); setIndex(0); setPicked(null); setScore(0); setMissed([]); };
  const start = async () => {
    setOpen(true); setLoading(true);
    try {
      const slugs = new Set(sections.map((s) => s.slug));
      const [allBlocks, allTerms] = await Promise.all([
        store.entities.ContentBlock.filter({ section: page }, 'order'),
        store.entities.PageSection.filter({ page: 'glossary_terms' }),
      ]);
      const blocks = allBlocks.filter((b) => !b.is_deleted && slugs.has(b.sub));
      const terms = allTerms.filter((t) => !t.is_deleted);
      const pool = buildQuestions(blocks, terms);
      setAll(pool); begin(pool);
    } catch { setAll([]); setQuiz([]); }
    finally { setLoading(false); }
  };

  const q = quiz[index];
  const pick = (opt) => {
    if (picked) return;
    setPicked(opt);
    if (opt === q.answer) setScore((s) => s + 1); else setMissed((m) => [...m, q]);
  };

  return (
    <>
      <button onClick={start} className="inline-flex items-center gap-2 min-h-[40px] rounded-full bg-[#1D4ED8] px-4 text-sm font-bold text-white hover:bg-[#1E40AF]">
        <ListChecks className="w-4 h-4" /> Quiz me
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Quiz: {title}</DialogTitle>
            <DialogDescription>Key words and facts from this unit's revision notes.</DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="h-40 animate-pulse bg-black/[0.04] rounded" />
          ) : !quiz.length ? (
            <p className="text-foreground/70">There is nothing to quiz here yet. The quiz uses the key words in these notes and any two-column table, such as term and meaning or date and event.</p>
          ) : index >= quiz.length ? (
            <div className="space-y-5">
              <div className="rounded-sm border border-border bg-card p-8 text-center space-y-3">
                <p className="chrono-eyebrow">Quiz complete</p>
                <p className="font-display text-5xl">{score} / {quiz.length}</p>
                <p className="text-foreground/70">{score === quiz.length ? 'Every one correct.' : 'Go back over the ones below, then try again.'}</p>
                <Button onClick={() => begin(all)} className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white"><RotateCcw className="w-4 h-4 mr-1.5" /> Try again</Button>
              </div>
              {missed.length > 0 && (
                <div>
                  <p className="chrono-eyebrow mb-2">To go over</p>
                  <ul className="divide-y divide-border border border-border rounded-sm">
                    {missed.map((m, i) => (
                      <li key={i} className="p-4">
                        <p className="font-bold">{m.stem}</p>
                        <p className="text-foreground/80">{m.answer}{m.note && <span lang="zh-Hans" className="ml-2 text-[#1E40AF]">{m.note}</span>}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-5">
              <div className="flex items-center justify-between text-sm font-semibold">
                <span>Question {index + 1} of {quiz.length}</span>
                <span>Score {score}</span>
              </div>
              <div className="rounded-sm bg-card border border-border p-6 space-y-3">
                <p className="chrono-eyebrow">{q.label} · {q.prompt}</p>
                <p className="font-display text-2xl leading-snug">{q.stem}</p>
              </div>
              <div className="grid gap-3">
                {q.options.map((opt) => {
                  const isRight = picked && opt === q.answer;
                  const isWrong = picked === opt && opt !== q.answer;
                  return (
                    <button key={opt} onClick={() => pick(opt)} disabled={!!picked}
                      className={`min-h-[52px] rounded-sm border-2 px-4 py-3 text-left font-semibold flex items-center justify-between gap-3 transition-colors ${
                        isRight ? 'border-teal-700 bg-teal-50 text-teal-900' : isWrong ? 'border-[#C2410C] bg-orange-50 text-orange-900' : 'border-border hover:border-[#1D4ED8]'
                      }`}>
                      <span>{opt}</span>
                      {isRight && <Check className="w-5 h-5 shrink-0" aria-label="Correct" />}
                      {isWrong && <X className="w-5 h-5 shrink-0" aria-label="Not correct" />}
                    </button>
                  );
                })}
              </div>
              {picked && (
                <div className="flex flex-wrap items-center justify-between gap-3" aria-live="polite">
                  <p className="font-semibold">
                    {picked === q.answer ? 'Correct.' : 'Not quite. The right answer is highlighted.'}
                    {q.note && <span lang="zh-Hans" className="ml-2 font-normal text-[#1E40AF]">{q.note}</span>}
                  </p>
                  <Button onClick={() => { setIndex((i) => i + 1); setPicked(null); }} className="bg-[#111827] hover:bg-black text-white">
                    {index + 1 === quiz.length ? 'See my score' : 'Next question'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
