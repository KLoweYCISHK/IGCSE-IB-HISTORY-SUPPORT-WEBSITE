import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdmin } from '@/lib/AdminContext';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import PageHero from '@/components/PageHero';
import SectionHeading from '@/components/SectionHeading';
import SectionCanvas from '@/components/SectionCanvas';
import ResourceLibrary from '@/components/ResourceLibrary';
import ExamVault from '@/components/ExamVault';
import TextbookSection from '@/components/TextbookSection';
import PerspectiveEngine from '@/components/perspectives/PerspectiveEngine';
import AddPerspectiveDialog from '@/components/perspectives/AddPerspectiveDialog';
import { UNITS } from '@/lib/perspectiveTopics';

const UNIT_KEYS = ['russian_revolution', 'cold_war'];

export default function Paper3() {
  const { user } = useAdmin();
  const [searchParams] = useSearchParams();
  const unitParam = searchParams.get('unit');
  const [unit, setUnit] = useState(UNIT_KEYS.includes(unitParam) ? unitParam : 'russian_revolution');
  const [adding, setAdding] = useState(false);
  const didScrollToPerspectives = useRef(false);

  useEffect(() => {
    if (didScrollToPerspectives.current) return;
    if (window.location.hash !== '#perspectives') return;
    didScrollToPerspectives.current = true;
    const node = document.getElementById('perspectives');
    if (!node) return;
    const align = () => node.scrollIntoView({ block: 'start' });
    align();
    // re-pin whenever the page height changes — late-loading content above would otherwise push the section back below the fold
    const ro = new ResizeObserver(() => align());
    ro.observe(document.body);
    const stop = window.setTimeout(() => ro.disconnect(), 3000);
    return () => { ro.disconnect(); window.clearTimeout(stop); };
  }, []);

  return (
    <div>
      <PageHero
        page="paper3"
        eyebrow="Depth study · Historical perspectives"
        title="Paper 3 (HL)"
        lede="Deep regional knowledge, essay craft, and a living library of historiography."
        image="https://media.base44.com/images/public/6a9374897e9609e0d36beee4/a44af5825_generated_e31a9e03.png"
      />

      {/* Module switcher + quick add */}
      <section className="border-b border-border bg-secondary/40">
        <div className="mx-auto max-w-[1100px] px-6 md:px-10 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="inline-flex flex-wrap border border-border rounded-sm overflow-hidden self-start">
            {UNIT_KEYS.map((k) => (
              <button
                key={k}
                onClick={() => setUnit(k)}
                className={`px-6 py-3 font-mono text-[11px] uppercase tracking-[0.2em] border-r border-border last:border-r-0 transition-colors ${
                  unit === k ? 'bg-[#6F551A] text-[#F4EFE3]' : 'text-foreground/60 hover:bg-black/[0.04]'
                }`}
              >
                {UNITS[k].label}
              </button>
            ))}
          </div>
          <Button className="bg-[#6F551A] hover:bg-[#5A4514] text-[#F4EFE3]" onClick={() => setAdding(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Add perspective
          </Button>
        </div>
        <div className="mx-auto max-w-[1100px] px-6 md:px-10 pb-6">
          <p className="max-w-2xl text-sm text-foreground/55">{UNITS[unit].blurb}</p>
        </div>
      </section>

      <SectionCanvas page="paper3" module={unit} />

      <TextbookSection section="paper3" module={unit} />

      <ResourceLibrary section="paper3" module={unit} />

      <ExamVault section="paper3" module={unit} description="Essay questions, how to structure a response, examples and mark schemes." />

      <section id="perspectives" className="py-16 md:py-24 border-t border-border scroll-mt-28">
        <SectionHeading
          eyebrow="Built by the class"
          title="Historical Perspectives"
          description="When you find a historian or school of thought, add it here so everyone can use it."
        />
        <PerspectiveEngine key={unit} unit={unit} />
      </section>

      <AddPerspectiveDialog
        open={adding}
        onOpenChange={setAdding}
        unit={unit}
        initial={{ student_name: user?.full_name || '' }}
        onSaved={() => { setAdding(false); window.dispatchEvent(new Event('perspectives:reload')); }}
      />
    </div>
  );
}