import React, { useState } from 'react';
import PageHero from '@/components/PageHero';
import SectionCanvas from '@/components/SectionCanvas';
import ResourceLibrary from '@/components/ResourceLibrary';
import ExamVault from '@/components/ExamVault';
import TextbookSection from '@/components/TextbookSection';
import RevisionTopics from '@/components/RevisionTopics';
import IgcseFocusUnits from '@/components/igcse/IgcseFocusUnits';
import { IB_UNIT_LABELS } from '@/lib/ibFocusLabels';
import CaseStudyFilter from '@/components/CaseStudyFilter';

const PAPER1_CASES = [
  { value: 'all', label: 'All case studies' },
  { value: 'postwar_europe', label: 'Post-war Europe' },
  { value: 'indochina_refugee', label: 'Indochina Refugee Crisis' },
];

export default function Paper1() {
  const initial = new URLSearchParams(window.location.search).get('case') || 'all';
  const [caseStudy, setCaseStudy] = useState(
    PAPER1_CASES.some((c) => c.value === initial) ? initial : 'all'
  );
  const isAll = caseStudy === 'all';

  return (
    <div>
      <PageHero
        page="paper1"
        eyebrow="Prescribed subject · Source paper"
        title="Paper 1"
        lede="The source booklet, the four questions, and the discipline of using evidence well."
        image="https://media.base44.com/images/public/6a9374897e9609e0d36beee4/4e12252d0_generated_db98e7d4.png"
      />

      <div className="sticky top-[92px] z-30 -mx-6 md:mx-0 px-6 md:px-0 py-4 bg-[#FFFFFF]/90 backdrop-blur border-y border-border">
        <CaseStudyFilter value={caseStudy} onChange={setCaseStudy} options={PAPER1_CASES} />
      </div>

      {isAll ? (
        <>
          <SectionCanvas page="paper1" />

          <section className="py-12 md:py-16 border-t border-border">
            <p className="chrono-eyebrow mb-3">Focus units & revision</p>
            <h2 className="font-display text-3xl md:text-4xl leading-[1.1] mb-3">Revise by case study</h2>
            <p className="text-foreground/60 text-[17px] mb-6">Choose a case study to open its focus units and revision notes.</p>
            <div className="flex flex-wrap gap-3">
              {PAPER1_CASES.filter((c) => c.value !== 'all').map((c) => (
                <button key={c.value} onClick={() => { setCaseStudy(c.value); window.scrollTo({ top: 0 }); }}
                  className="min-h-[48px] rounded-full bg-[#1D4ED8] px-6 font-bold text-white hover:bg-[#1E40AF]">
                  {c.label}
                </button>
              ))}
            </div>
          </section>

          <ExamVault
            section="paper1"
            title="The Exam Vault"
            description="Each question type, how to approach it, and an annotated example."
          />

          <TextbookSection section="paper1" caseStudy="all" />
        </>
      ) : (
        <>
          <IgcseFocusUnits
            key={caseStudy}
            page={`paper1_${caseStudy}`}
            title={`Focus units: ${PAPER1_CASES.find((c) => c.value === caseStudy)?.label}`}
            description="Open a focus unit to see what you need to know and its revision notes. Tick off each revision topic as you go."
            {...IB_UNIT_LABELS}
          />
          <RevisionTopics key={`legacy-${caseStudy}`} page="paper1" scope={caseStudy} scopeLabel={PAPER1_CASES.find((c) => c.value === caseStudy)?.label} />
          <ResourceLibrary section="paper1" caseStudy={caseStudy} />
        </>
      )}
    </div>
  );
}