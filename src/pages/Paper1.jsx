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

// Each case study is its own page: its own focus units, specified content, revision notes and resources.
const PAPER1_CASES = [
  { value: 'postwar_europe', label: 'Post-war Europe' },
  { value: 'indochina_refugee', label: 'Indochina Refugee Crisis' },
];

export default function Paper1() {
  const initial = new URLSearchParams(window.location.search).get('case');
  const [caseStudy, setCaseStudy] = useState(PAPER1_CASES.some((c) => c.value === initial) ? initial : PAPER1_CASES[0].value);
  const index = PAPER1_CASES.findIndex((c) => c.value === caseStudy);
  const label = PAPER1_CASES[index].label;

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

      {/* the inquiry table on this page has one column of lines of inquiry per case study, in this order */}
      <IgcseFocusUnits
        key={caseStudy}
        page={`paper1_${caseStudy}`}
        title={`Focus units: ${label}`}
        description="Open an inquiry question to see its lines of inquiry and revision notes. Tick off each revision topic as you go."
        seed={{ section: 'paper1', column: index + 1 }}
        {...IB_UNIT_LABELS}
      />
      <RevisionTopics key={`legacy-${caseStudy}`} page="paper1" scope={caseStudy} scopeLabel={label} />
      <ResourceLibrary section="paper1" caseStudy={caseStudy} />

      <SectionCanvas page="paper1" />

      <ExamVault
        section="paper1"
        title="The Exam Vault"
        description="Each question type, how to approach it, and an annotated example."
      />

      <TextbookSection section="paper1" caseStudy="all" />
    </div>
  );
}
