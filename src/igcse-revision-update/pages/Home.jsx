import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import SectionCanvas from '@/components/SectionCanvas';
import QuickPerspectiveActions from '@/components/perspectives/QuickPerspectiveActions';
import QuickAddPerspectiveButton from '@/components/perspectives/QuickAddPerspectiveButton';
import { useTrack } from '@/lib/TrackContext';
import { useProgress } from '@/lib/progress';

const IB_INDEX = [
  { to: '/paper-1', label: 'Paper 1', note: 'Source-based prescribed subject' },
  { to: '/paper-2', label: 'Paper 2', note: 'Three case studies: Hitler · Castro · Chiang Kai-shek' },
  { to: '/paper-3', label: 'Paper 3', note: 'Depth study & historical perspectives' },
  { to: '/revision', label: 'Revision notes', note: 'Notes, key terms and flashcards. Tick off topics as you go.' },
  { to: '/historians', label: 'Historians bank', note: 'Browse, flashcards, quiz and your essay toolkit' },
  { to: '/ia', label: 'Internal Assessment', note: 'Preparing · Writing · Mark scheme' },
  { to: '/ee', label: 'Extended Essay', note: 'Preparing · Writing · Reflection' },
];

const IGCSE_INDEX = [
  { to: '/igcse/core1', label: 'Core 1', note: 'Focus units and revision notes · 1917–1939' },
  { to: '/igcse/core2', label: 'Core 2', note: 'Focus units and revision notes · 1945–1989' },
  { to: '/igcse/depth', label: 'Depth Study', note: 'Focus units and revision notes · Weimar & Nazi Germany' },
  { to: '/igcse/paper1', label: 'Paper 1', note: 'Knowledge based exam support' },
  { to: '/igcse/paper2', label: 'Paper 2', note: 'Source based exam support' },
  { to: '/igcse/coursework', label: 'Coursework', note: 'Step-by-step guidance & examples' },
];

// one band colour per card, repeating: blue, orange, teal
const BANDS = ['bg-[#1D4ED8]', 'bg-[#C2410C]', 'bg-[#0F766E]'];

function ContinuePanel({ track }) {
  const { last, revised, saved } = useProgress();
  const resume = last && last.track === track ? last : null;
  const ticks = Object.keys(revised).length;
  const stars = Object.keys(saved).length;

  return (
    <div className="w-full lg:w-[380px] shrink-0 rounded-sm bg-[#1D4ED8] text-white p-6 flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-[0.12em]">{resume ? 'Pick up where you left off' : 'Start here'}</p>
      <p className="font-display text-2xl leading-tight">{resume ? resume.label : track === 'igcse' ? 'Core 1 revision' : 'Revision notes'}</p>
      <p className="text-sm">
        {ticks || stars
          ? `${ticks} topic${ticks === 1 ? '' : 's'} revised · ${stars} historian${stars === 1 ? '' : 's'} saved on this device`
          : 'Tick off topics as you revise. Your progress saves on this device, no login needed.'}
      </p>
      <Link to={resume ? resume.path : track === 'igcse' ? '/igcse/core1' : '/revision'}
        className="mt-1 inline-flex items-center justify-center gap-2 min-h-[46px] rounded-full bg-[#111827] text-white font-bold hover:bg-black">
        {resume ? 'Continue' : 'Start revising'} <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}

export default function Home() {
  const { track } = useTrack();
  const igcse = track === 'igcse';
  const index = igcse ? IGCSE_INDEX : IB_INDEX;

  return (
    <div className="pb-10">
      <section className="py-10 md:py-14 flex flex-col lg:flex-row lg:items-stretch lg:justify-between gap-8">
        <div className="flex flex-col gap-4 justify-center">
          <p className="chrono-eyebrow">{igcse ? 'IGCSE History' : 'IB History'} · Ms Lowe</p>
          <h1 className="font-display text-4xl md:text-6xl leading-[1.02] max-w-2xl">
            Everything you need to revise {igcse ? 'IGCSE' : 'IB'} History.
          </h1>
          <p className="max-w-xl text-foreground/70">Exam questions, mark schemes, revision notes and support, all in one place.</p>
          {!igcse && <div><QuickAddPerspectiveButton /></div>}
        </div>
        <ContinuePanel track={track} />
      </section>

      <section className="py-10 md:py-14 border-t border-border">
        <SectionHeading title="Where would you like to begin?" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {index.map((i, n) => (
            <Link key={i.to} to={i.to} className="glassine group flex flex-col border border-border bg-card rounded-sm p-7 hover:border-[#1D4ED8]">
              <span className={`block h-2 w-14 rounded-full ${BANDS[n % BANDS.length]}`} />
              <p className="mt-5 font-display text-3xl leading-none">{i.label}</p>
              <p className="mt-3 text-sm text-foreground/70 leading-relaxed">{i.note}</p>
              <p className="mt-auto pt-5 text-sm font-bold text-[#1D4ED8] inline-flex items-center gap-1.5">
                Open <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </p>
            </Link>
          ))}
        </div>
      </section>

      {!igcse && <QuickPerspectiveActions />}

      <SectionCanvas page={igcse ? 'igcse_home' : 'home'} />
    </div>
  );
}
