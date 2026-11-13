import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, RotateCcw } from 'lucide-react';
import { schoolOf, maskSchools, UNITS } from '@/lib/perspectiveTopics';

const shuffled = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

// "Which school of thought is this?" — an idea is shown, students pick the school.
// Names and exact wording are not tested.
export default function PerspectiveQuiz({ items, pool }) {
  const usable = useMemo(() => items.filter((i) => schoolOf(i)), [items]);
  const options = useMemo(() => {
    const present = [...new Set(pool.map(schoolOf).filter(Boolean))];
    const known = UNITS[pool[0]?.unit]?.schools || [];
    return [...known.filter((s) => present.includes(s)), ...present.filter((s) => !known.includes(s))];
  }, [pool]);
  const ids = usable.map((i) => i.id).join(',');
  const [quiz, setQuiz] = useState([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);

  const restart = () => { setQuiz(shuffled(usable).slice(0, 10)); setIndex(0); setPicked(null); setScore(0); };
  useEffect(restart, [ids]); // eslint-disable-line react-hooks/exhaustive-deps

  if (options.length < 2 || !usable.length) {
    return <p className="text-foreground/60">The quiz needs ideas from at least two schools of thought in this unit. Set the school on more ideas to unlock it.</p>;
  }
  if (!quiz.length) return null;

  if (index >= quiz.length) {
    return (
      <div className="max-w-2xl mx-auto rounded-sm border border-border bg-card p-10 text-center space-y-4">
        <p className="chrono-eyebrow">Quiz complete</p>
        <p className="font-display text-5xl">{score} / {quiz.length}</p>
        <p className="text-foreground/70">{score === quiz.length ? 'Every one correct.' : 'Flashcards are a good way to learn the ones you missed.'}</p>
        <Button onClick={restart} className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white"><RotateCcw className="w-4 h-4 mr-1.5" /> Try again</Button>
      </div>
    );
  }

  const q = quiz[index];
  const right = schoolOf(q);
  const pick = (opt) => { if (picked) return; setPicked(opt); if (opt === right) setScore((s) => s + 1); };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="flex items-center justify-between text-sm font-semibold">
        <span>Question {index + 1} of {quiz.length}</span>
        <span>Score {score}</span>
      </div>
      <div className="rounded-sm bg-card border border-border p-7 space-y-3">
        <p className="chrono-eyebrow">Which school of thought is this? · {q.topic}</p>
        <p className="font-display text-2xl leading-snug">{picked ? q.argument : maskSchools(q.argument, q.unit)}</p>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const isRight = picked && opt === right;
          const isWrong = picked === opt && opt !== right;
          return (
            <button key={opt} onClick={() => pick(opt)} disabled={!!picked}
              className={`min-h-[56px] rounded-sm border-2 px-4 py-3 text-left font-semibold flex items-center justify-between gap-3 transition-colors ${
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
          <p className="font-semibold">{picked === right ? 'Correct.' : `Not quite. This is the ${right.toLowerCase()} view.`}</p>
          <Button onClick={() => { setIndex((i) => i + 1); setPicked(null); }} className="bg-[#111827] hover:bg-black text-white">
            {index + 1 === quiz.length ? 'See my score' : 'Next question'}
          </Button>
        </div>
      )}
    </div>
  );
}
