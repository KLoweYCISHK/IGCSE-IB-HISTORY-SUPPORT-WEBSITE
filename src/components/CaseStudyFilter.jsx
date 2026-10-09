import React from 'react';

export const CASE_STUDIES = [
  { value: 'all', label: 'All case studies' },
  { value: 'hitler', label: 'Hitler' },
  { value: 'castro', label: 'Castro' },
  { value: 'chiang', label: 'Chiang Kai-shek' },
];

export default function CaseStudyFilter({ value, onChange, options = CASE_STUDIES }) {
  return (
    <div className="flex flex-wrap max-w-full border border-border rounded-sm overflow-hidden">
      {options.map((c) => (
        <button
          key={c.value}
          onClick={() => onChange(c.value)}
          className={`px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors duration-300 border-r border-border last:border-r-0 ${
            value === c.value ? 'bg-[#6F551A] text-[#F4EFE3]' : 'text-foreground/60 hover:bg-black/[0.04]'
          }`}
        >
          {c.label}
        </button>
      ))}
    </div>
  );
}