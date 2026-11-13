import React, { useState } from 'react';
import PageHero from '@/components/PageHero';
import SectionCanvas from '@/components/SectionCanvas';
import ResourceLibrary from '@/components/ResourceLibrary';
import ExamVault from '@/components/ExamVault';
import TextbookSection from '@/components/TextbookSection';
import RevisionTopics, { RevisionCaseList } from '@/components/RevisionTopics';
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

          <RevisionCaseList page="paper2" cases={CASE_STUDIES.filter((c) => c.value !== 'all')} onPick={setCaseStudy} />

          <ExamVault
            section="paper2"
            title="The Exam Vault"
            description="Example questions, example answers, mark schemes and concept imagery."
          />

          <TextbookSection section="paper2" caseStudy="all" />
        </>
      ) : (
        <>
          <RevisionTopics key={caseStudy} page="paper2" scope={caseStudy} scopeLabel={CASE_STUDIES.find((c) => c.value === caseStudy)?.label} />
          <ResourceLibrary section="paper2" caseStudy={caseStudy} />
        </>
      )}
    </div>
  );
}