import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { store } from '@/api/firebaseClient';
import { useAdmin } from '@/lib/AdminContext';
import { useTrack } from '@/lib/TrackContext';
import { REVISION } from '@/lib/revisionUnits';
import { useProgress } from '@/lib/progress';
import RevisedTick from '@/components/RevisedTick';
import PageHero from '@/components/PageHero';
import SectionCanvas from '@/components/SectionCanvas';
import ProgressTransfer from '@/components/ProgressTransfer';

function ProgressBar({ done, total, label }) {
  const pct = total ? Math.round((done / total) * 100) : 0;
  return (
    <div className="h-2.5 rounded-full bg-border overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={label}>
      <div className="h-full bg-[#1D4ED8] transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default function Revision() {
  const { track } = useTrack();
  const { editMode } = useAdmin();
  const { revised } = useProgress();
  const cfg = REVISION[track === 'igcse' ? 'igcse' : 'ib'];
  const [params, setParams] = useSearchParams();
  const unit = cfg.units.some((u) => u.key === params.get('unit')) ? params.get('unit') : cfg.units[0].key;
  const [sections, setSections] = useState([]);

  // every topic on the page, so each unit can show how many are ticked
  const load = useCallback(async () => {
    try {
      const list = await store.entities.PageSection.filter({ page: cfg.page });
      setSections(list.filter((s) => !s.is_deleted));
    } catch { setSections([]); }
  }, [cfg.page]);

  useEffect(() => {
    load();
    window.addEventListener('archive:reload', load);
    return () => window.removeEventListener('archive:reload', load);
  }, [load]);

  const counts = useMemo(() => Object.fromEntries(cfg.units.map((u) => {
    const mine = sections.filter((s) => s.module === u.key);
    return [u.key, { total: mine.length, done: mine.filter((s) => revised[s.id]).length }];
  })), [cfg.units, sections, revised]);

  const current = counts[unit] || { total: 0, done: 0 };
  const unitLabel = cfg.units.find((u) => u.key === unit)?.label;

  const tick = (s) => <RevisedTick id={s.id} />;

  return (
    <div>
      <PageHero
        page={cfg.page}
        eyebrow="Revision notes"
        title="Revise"
        lede="Notes, key terms and timelines for each unit. Tick off each topic as you revise it."
      />

      <section className="pb-8 space-y-5">
        <div role="tablist" aria-label="Choose a unit" className="flex flex-wrap gap-2">
          {cfg.units.map((u) => {
            const c = counts[u.key];
            return (
              <button key={u.key} role="tab" aria-selected={unit === u.key} onClick={() => setParams({ unit: u.key }, { replace: true })}
                className={`min-h-[44px] rounded-full px-5 text-sm font-bold transition-colors ${
                  unit === u.key ? 'bg-[#111827] text-white' : 'border border-border hover:border-[#111827]'
                }`}>
                {u.label}{c?.total ? ` · ${c.done}/${c.total}` : ''}
              </button>
            );
          })}
        </div>

        {current.total > 0 && (
          <div className="rounded-sm bg-card border border-border p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="font-semibold">{current.done} of {current.total} topics revised · {unitLabel}</p>
              <ProgressTransfer />
            </div>
            <ProgressBar done={current.done} total={current.total} label={`${unitLabel} topics revised`} />
            <p className="text-sm text-muted-foreground">Your ticks are saved on this device. No login needed.</p>
          </div>
        )}

        {editMode && (
          <div className="rounded-sm border border-dashed border-[#1D4ED8] bg-[#1D4ED8]/5 p-5 text-sm space-y-1">
            <p className="font-bold">Adding revision notes (only you see this)</p>
            <p>Add one section per topic in this unit. Students get a "Mark as revised" tick on every section.</p>
            <p>Inside a section, add text, images, files or links as usual. Any two-column table (term and meaning, date and event, question and answer) also gets a "Test yourself with flashcards" button.</p>
          </div>
        )}
      </section>

      <SectionCanvas
        key={unit}
        page={cfg.page}
        module={unit}
        sectionAction={tick}
        tableFlashcards
        keyTerms
        keyTermsLabel={unitLabel}
        scopeSlugs
        empty={!editMode && (
          <div className="py-16 border-t border-border text-center">
            <p className="font-display text-3xl">Notes for {unitLabel} are on their way.</p>
            <p className="mt-2 text-foreground/60">Check back soon, or use the exam questions and mark schemes for this unit in the meantime.</p>
          </div>
        )}
      />
    </div>
  );
}
