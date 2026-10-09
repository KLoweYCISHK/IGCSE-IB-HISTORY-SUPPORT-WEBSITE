import React, { useState } from 'react';
import PageHero from '@/components/PageHero';
import SectionCanvas from '@/components/SectionCanvas';
import ResourceLibrary from '@/components/ResourceLibrary';
import ExamVault from '@/components/ExamVault';
import TextbookSection from '@/components/TextbookSection';
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

      <div className="sticky top-[92px] z-30 -mx-6 md:mx-0 px-6 md:px-0 py-4 bg-[#F4EFE3]/90 backdrop-blur border-y border-border">
        <CaseStudyFilter value={caseStudy} onChange={setCaseStudy} options={PAPER1_CASES} />
      </div>

      {isAll ? (
        <>
          <SectionCanvas page="paper1" />

          <ExamVault
            section="paper1"
            title="The Exam Vault"
            description="Each question type, how to approach it, and an annotated example."
          />

          <TextbookSection section="paper1" caseStudy="all" />
        </>
      ) : (
        <ResourceLibrary section="paper1" caseStudy={caseStudy} />
      )}
    </div>
  );
}