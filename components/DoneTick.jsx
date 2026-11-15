import React from 'react';
import { Check, Circle } from 'lucide-react';
import { toggle, useProgress } from '@/lib/progress';

// Exam questions share the "revised" store with the revision ticks, under their own prefix,
// so they are saved on the student's own device and travel with "Move my progress to another device".
const key = (id) => `q_${id}`;

// "Mark as completed" for one exam question or paper.
export default function DoneTick({ id }) {
  const { revised } = useProgress();
  const done = !!revised[key(id)];
  return (
    <button onClick={() => toggle('revised', key(id))} aria-pressed={done}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full min-h-[36px] px-3.5 text-xs font-bold transition-colors ${
        done ? 'bg-teal-700 text-white hover:bg-teal-800' : 'border-2 border-border hover:border-[#1D4ED8]'
      }`}>
      {done ? <Check className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
      {done ? 'Completed' : 'Mark as completed'}
    </button>
  );
}

// "3 of 12 questions completed" with a bar, for the questions currently on show.
export function DoneCount({ ids, noun = 'questions' }) {
  const { revised } = useProgress();
  if (!ids.length) return null;
  const done = ids.filter((id) => revised[key(id)]).length;
  return (
    <div className="mb-5 max-w-md space-y-1.5">
      <p className="text-sm font-semibold">{done} of {ids.length} {noun} completed <span className="font-normal text-foreground/55">· saved on this device</span></p>
      <div className="h-2 rounded-full bg-border overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={ids.length} aria-valuenow={done} aria-label={`${noun} completed`}>
        <div className="h-full bg-teal-700 transition-all" style={{ width: `${(done / ids.length) * 100}%` }} />
      </div>
    </div>
  );
}
