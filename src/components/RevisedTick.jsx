import React from 'react';
import { Check, Circle } from 'lucide-react';
import { toggle, useProgress } from '@/lib/progress';

// "Mark as revised" for one revision topic. Saved on the student's own device.
export default function RevisedTick({ id, small = false }) {
  const { revised } = useProgress();
  const done = !!revised[id];
  return (
    <button onClick={() => toggle('revised', id)} aria-pressed={done}
      className={`inline-flex items-center gap-2 rounded-full font-bold transition-colors ${small ? 'min-h-[40px] px-4 text-sm' : 'min-h-[44px] px-5 text-sm'} ${
        done ? 'bg-teal-700 text-white hover:bg-teal-800' : 'border-2 border-border hover:border-[#1D4ED8]'
      }`}>
      {done ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
      {done ? 'Revised' : 'Mark as revised'}
    </button>
  );
}
