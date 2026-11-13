import React from 'react';

export default function SectionHeading({ eyebrow, title, description, right }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
      <div className="max-w-2xl">
        {eyebrow && <p className="chrono-eyebrow mb-3">{eyebrow}</p>}
        <h2 className="font-display text-3xl md:text-4xl leading-[1.1]">{title}</h2>
        {description && <p className="mt-3 text-foreground/60 text-[17px]" dangerouslySetInnerHTML={{ __html: String(description).replace(/&nbsp;|\u00A0/g, ' ') }} />}
      </div>
      {right}
    </div>
  );
}