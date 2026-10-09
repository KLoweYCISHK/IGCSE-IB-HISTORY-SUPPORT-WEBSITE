import React from 'react';
import { Link } from 'react-router-dom';
import SectionHeading from '@/components/SectionHeading';
import SectionCanvas from '@/components/SectionCanvas';
import QuickPerspectiveActions from '@/components/perspectives/QuickPerspectiveActions';
import QuickAddPerspectiveButton from '@/components/perspectives/QuickAddPerspectiveButton';
import { useTrack } from '@/lib/TrackContext';

const IB_INDEX = [
  { to: '/paper-1', label: 'Paper 1', note: 'Source-based prescribed subject' },
  { to: '/paper-2', label: 'Paper 2', note: 'Three case studies: Hitler · Castro · Chiang Kai-shek' },
  { to: '/paper-3', label: 'Paper 3', note: 'Depth study & historical perspectives' },
  { to: '/ia', label: 'Internal Assessment', note: 'Preparing · Writing · Mark scheme' },
  { to: '/ee', label: 'Extended Essay', note: 'Preparing · Writing · Reflection' },
];

const IGCSE_INDEX = [
  { to: '/igcse/core1', label: 'Core 1', note: 'Core content part 1 — 1917–1939' },
  { to: '/igcse/core2', label: 'Core 2', note: 'Core content part 2 — 1945–1989' },
  { to: '/igcse/depth', label: 'Depth Study', note: 'Weimar & Nazi Germany' },
  { to: '/igcse/paper1', label: 'Paper 1', note: 'Knowledge based exam support' },
  { to: '/igcse/paper2', label: 'Paper 2', note: 'Source based exam support' },
  { to: '/igcse/coursework', label: 'Coursework', note: 'Step-by-step guidance & examples' },
];

export default function Home() {
  const { track } = useTrack();

  if (track === 'igcse') {
    return (
      <div className="pb-10">
        <section className="py-10 md:py-14 border-b border-border">
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight max-w-4xl">
            The IGCSE History archive.
          </h1>
        </section>

        <section className="py-16 md:py-20">
          <SectionHeading eyebrow="The index" title="Where would you like to begin?" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {IGCSE_INDEX.map((i) => (
              <Link key={i.to} to={i.to} className="glassine border border-border bg-card rounded-sm p-8 hover:border-[#6F551A]">
                <p className="font-display text-4xl leading-none">{i.label}</p>
                <p className="mt-4 text-sm text-foreground/55 leading-relaxed">{i.note}</p>
                <p className="mt-6 chrono-eyebrow text-[#6F551A]">Enter →</p>
              </Link>
            ))}
          </div>
        </section>

        <SectionCanvas page="igcse_home" />
      </div>
    );
  }

  return (
    <div className="pb-10">
      <section className="py-10 md:py-14 border-b border-border">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95] tracking-tight max-w-4xl">
            The IB History archive.
          </h1>
          <div className="shrink-0 sm:pt-3">
            <QuickAddPerspectiveButton />
          </div>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <SectionHeading eyebrow="The index" title="Where would you like to begin?" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {IB_INDEX.map((i) => (
            <Link key={i.to} to={i.to} className="glassine border border-border bg-card rounded-sm p-8 hover:border-[#6F551A]">
              <p className="font-display text-4xl leading-none">{i.label}</p>
              <p className="mt-4 text-sm text-foreground/55 leading-relaxed">{i.note}</p>
              <p className="mt-6 chrono-eyebrow text-[#6F551A]">Enter →</p>
            </Link>
          ))}
        </div>
      </section>

      <QuickPerspectiveActions />

      <SectionCanvas page="home" />

    </div>
  );
}