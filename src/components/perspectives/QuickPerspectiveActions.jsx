import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';

const TOPICS = [
  {
    unit: 'russian_revolution',
    label: 'Russian Revolution perspectives',
    note: 'Tsars, Bolsheviks, and the historiographical debates around 1855–1924.',
  },
  {
    unit: 'cold_war',
    label: 'Cold War perspectives',
    note: 'Origins, crises, and the arguments over the bipolar order.',
  },
];

export default function QuickPerspectiveActions() {
  return (
    <section className="py-16 md:py-24 border-t border-border">
      <SectionHeading
        eyebrow="Paper 3 · Historiography"
        title="Historical Perspectives"
        description="A living library built by the class. Pick a topic to jump straight to that section, or add a historian you've found."
      />
      <div className="mt-8 grid sm:grid-cols-2 gap-5">
        {TOPICS.map((t) => (
          <Link
            key={t.unit}
            to={`/paper-3?unit=${t.unit}#perspectives`}
            className="glassine group border border-border bg-card rounded-sm p-8 hover:border-[#6F551A]"
          >
            <p className="font-display text-3xl leading-snug">{t.label}</p>
            <p className="mt-3 text-sm text-foreground/55 leading-relaxed">{t.note}</p>
            <p className="mt-6 chrono-eyebrow text-[#6F551A] inline-flex items-center gap-1.5">
              Open this section <ArrowRight className="w-3.5 h-3.5" />
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}