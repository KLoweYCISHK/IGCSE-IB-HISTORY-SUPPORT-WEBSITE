import React, { useState } from 'react';
import PageHero from '@/components/PageHero';
import SectionCanvas from '@/components/SectionCanvas';
import ResourceLibrary from '@/components/ResourceLibrary';
import ExamVault from '@/components/ExamVault';
import TextbookSection from '@/components/TextbookSection';
import RevisionTopics from '@/components/RevisionTopics';
import IgcseFocusUnits from '@/components/igcse/IgcseFocusUnits';
import { IB_UNIT_LABELS } from '@/lib/ibFocusLabels';
import CaseStudyFilter, { CASE_STUDIES } from '@/components/CaseStudyFilter';

export default function Paper2() {
  const initial = new URLSearchParams(window.location.search).get('case') || 'all';
  const [caseStudy, setCaseStudy] = useState(
    CASE_STUDIES.some((c) => c.value === initial) ? initial : 'all'
  );
  const isAll = caseStudy === 'all';

  return (
    <div>
      <PageHero
        page="paper2"
        eyebrow="World history topics · Three case studies"
        title="Paper 2"
        lede="Authoritarian states through Hitler, Castro and Chiang Kai-shek — compared, contrasted, argued."
        image="https://media.base44.com/images/public/6a9374897e9609e0d36beee4/959d5349b_generated_e709b72b.png"
      />

      <div className="sticky top-[92px] z-30 -mx-6 md:mx-0 px-6 md:px-0 py-4 bg-[#FFFFFF]/90 backdrop-blur border-y border-border">
        <CaseStudyFilter value={caseStudy} onChange={setCaseStudy} />
      </div>

      {isAll ? (
        <>
          <SectionCanvas page="paper2" />

          <section className="py-12 md:py-16 border-t border-border">
            <p className="chrono-eyebrow mb-3">Focus units & revision</p>
            <h2 className="font-display text-3xl md:text-4xl leading-[1.1] mb-3">Revise by case study</h2>
            <p className="text-foreground/60 text-[17px] mb-6">Each case study has its own page of focus units, specified content and revision notes.</p>
            <div className="flex flex-wrap gap-3">
              {CASE_STUDIES.filter((c) => c.value !== 'all').map((c) => (
                <button key={c.value} onClick={() => { setCaseStudy(c.value); window.scrollTo({ top: 0 }); }}
                  className="min-h-[48px] rounded-full bg-[#1D4ED8] px-6 font-bold text-white hover:bg-[#1E40AF]">
                  {c.label}
                </button>
              ))}
            </div>
          </section>

          <ExamVault
            section="paper2"
            title="The Exam Vault"
            description="Example questions, example answers, mark schemes and concept imagery."
          />

          <TextbookSection section="paper2" caseStudy="all" />
        </>
      ) : (
        <>
          <IgcseFocusUnits
            key={caseStudy}
            page={`paper2_${caseStudy}`}
            title={`Focus units: ${CASE_STUDIES.find((c) => c.value === caseStudy)?.label}`}
            description="Open a focus unit to see what you need to know and its revision notes. Tick off each revision topic as you go."
            {...IB_UNIT_LABELS}
          />
          <RevisionTopics key={`legacy-${caseStudy}`} page="paper2" scope={caseStudy} scopeLabel={CASE_STUDIES.find((c) => c.value === caseStudy)?.label} />
          <ResourceLibrary section="paper2" caseStudy={caseStudy} />
        </>
      )}
    </div>
  );
}