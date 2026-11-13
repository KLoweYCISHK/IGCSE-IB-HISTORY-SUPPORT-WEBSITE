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

// Each case study is its own page: its own focus units, specified content, revision notes and resources.
const CASES = CASE_STUDIES.filter((c) => c.value !== 'all');

export default function Paper2() {
  const initial = new URLSearchParams(window.location.search).get('case');
  const [caseStudy, setCaseStudy] = useState(CASES.some((c) => c.value === initial) ? initial : CASES[0].value);
  const label = CASES.find((c) => c.value === caseStudy)?.label;

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
        <CaseStudyFilter value={caseStudy} onChange={setCaseStudy} options={CASES} />
      </div>

      <IgcseFocusUnits
        key={caseStudy}
        page={`paper2_${caseStudy}`}
        title={`Focus units: ${label}`}
        description="Open an inquiry question to see its lines of inquiry and revision notes. Tick off each revision topic as you go."
        seed={{ section: 'paper2', column: 1 }}
        {...IB_UNIT_LABELS}
      />
      <RevisionTopics key={`legacy-${caseStudy}`} page="paper2" scope={caseStudy} scopeLabel={label} />
      <ResourceLibrary section="paper2" caseStudy={caseStudy} />

      <SectionCanvas page="paper2" />

      <ExamVault
        section="paper2"
        title="The Exam Vault"
        description="Example questions, example answers, mark schemes and concept imagery."
      />

      <TextbookSection section="paper2" caseStudy="all" />
    </div>
  );
}
