import React from 'react';
import { useSearchParams } from 'react-router-dom';
import PageHero from '@/components/PageHero';
import PerspectiveEngine from '@/components/perspectives/PerspectiveEngine';
import ProgressTransfer from '@/components/ProgressTransfer';
import { UNITS, UNIT_KEYS } from '@/lib/perspectiveTopics';

export default function Historians() {
  const [params, setParams] = useSearchParams();
  const unit = UNIT_KEYS.includes(params.get('unit')) ? params.get('unit') : UNIT_KEYS[0];

  return (
    <div>
      <PageHero
        page="historians"
        eyebrow="Paper 3 · Built by the class"
        title="Perspectives bank"
        lede="Learn what each school of thought argues. You need the ideas and the school, not who said it or the exact words."
      />
      <section className="pb-16 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div role="tablist" aria-label="Choose a unit" className="flex flex-wrap gap-2">
            {UNIT_KEYS.map((k) => (
              <button key={k} role="tab" aria-selected={unit === k} onClick={() => setParams({ unit: k }, { replace: true })}
                className={`min-h-[44px] rounded-full px-5 text-sm font-bold transition-colors ${
                  unit === k ? 'bg-[#1D4ED8] text-white' : 'border border-border hover:border-[#1D4ED8]'
                }`}>
                {UNITS[k].label}
              </button>
            ))}
          </div>
          <ProgressTransfer />
        </div>
        <p className="max-w-2xl text-sm text-foreground/70">{UNITS[unit].blurb}</p>
        <PerspectiveEngine key={unit} unit={unit} />
      </section>
    </div>
  );
}
