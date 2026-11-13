import React from 'react';

export const CASE_STUDIES = [
  { value: 'all', label: 'All case studies' },
  { value: 'hitler', label: 'Hitler' },
  { value: 'castro', label: 'Castro' },
  { value: 'chiang', label: 'Chiang Kai-shek' },
];

export default function CaseStudyFilter({ value, onChange, options = CASE_STUDIES }) {
  return (
    <div className="flex flex-wrap max-w-full gap-2">
      {options.map((c) => (
        <button
          key={c.value}
          onClick={() => onChange(c.value)}
          aria-pressed={value === c.value}
          className={`min-h-[40px] rounded-full px-5 text-sm font-bold transition-colors ${
            value === c.value ? 'bg-[#1D4ED8] text-white' : 'border border-border text-foreground/75 hover:border-[#1D4ED8]'
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}