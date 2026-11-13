import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import PageHero from '@/components/PageHero';
import SectionHeading from '@/components/SectionHeading';
import SectionCanvas from '@/components/SectionCanvas';
import ResourceLibrary from '@/components/ResourceLibrary';
import TextbookSection from '@/components/TextbookSection';
import Roadmap from '@/components/Roadmap';
import DocumentSection from '@/components/DocumentSection';
import FinalChecklist from '@/components/FinalChecklist';
import IgcsePaper1Exam from '@/components/igcse/IgcsePaper1Exam';
import IgcsePaper2Links from '@/components/igcse/IgcsePaper2Links';
import IgcsePaper2Focus from '@/components/igcse/IgcsePaper2Focus';
import IgcseFocusUnits from '@/components/igcse/IgcseFocusUnits';
import StageFlow from '@/components/StageFlow';

const TOPICS = {
  core1: {
    page: 'igcse_core1',
    eyebrow: 'Core content · Part 1',
    title: '1917–1939',
    lede: 'The shaping of the post-war world — from the Russian Revolution to the road to war.',
    hasTextbook: true,
    hasFocusUnits: true,
  },
  core2: {
    page: 'igcse_core2',
    eyebrow: 'Core content · Part 2',
    title: '1945–1989',
    lede: 'The Cold War world — from Yalta and Potsdam to the collapse of the Soviet bloc.',
    hasTextbook: true,
    hasFocusUnits: true,
  },
  depth: {
    page: 'igcse_depth',
    eyebrow: 'Depth study',
    title: 'Weimar & Nazi Germany',
    lede: 'Germany from the Weimar Republic to the Nazi state — collapse, consolidation, and control.',
    hasTextbook: true,
    hasFocusUnits: true,
  },
  paper1: {
    page: 'igcse_paper1',
    eyebrow: 'Examination',
    title: 'Paper 1',
    lede: 'The knowledge-based paper — how to approach each question type and a bank of practice questions.',
    exam: 'paper1',
    hasTextbook: false,
  },
  paper2: {
    page: 'igcse_paper2',
    eyebrow: 'Examination',
    title: 'Paper 2',
    lede: 'The source-based paper — pick a topic, then open the paper and its mark scheme.',
    exam: 'paper2',
    hasTextbook: false,
  },
  coursework: {
    page: 'igcse_coursework',
    eyebrow: 'Coursework',
    title: 'Coursework',
    lede: 'An historical investigation of your own making. Follow the roadmap, step by step.',
    isCoursework: true,
  },
};


export default function IgcseTopic() {
  const { topic } = useParams();
  const cfg = TOPICS[topic];
  if (!cfg) return <Navigate to="/" replace />;

  return (
    <div>
      <PageHero page={cfg.page} eyebrow={cfg.eyebrow} title={cfg.title} lede={cfg.lede} />

      {cfg.isCoursework && (
        <section className="py-12 md:py-16 border-t border-border">
          <SectionHeading eyebrow="The roadmap" title="Step by step" description="Follow the stages in order. Open a step, work through it, then tick it off." />
          <StageFlow stages={[
            { value: 'preparing', label: 'Preparing', content: <Roadmap section={cfg.page} stages={[{ key: 'preparing', label: 'Preparing' }]} /> },
            { value: 'writing', label: 'Writing', content: <Roadmap section={cfg.page} stages={[{ key: 'writing', label: 'Writing' }]} /> },
            { value: 'markscheme', label: 'Examples', content: <DocumentSection section={cfg.page} title="Example coursework" description="Annotated examples — download them and study the marking." embedded /> },
            { value: 'checklist', label: 'Final checklist', content: <FinalChecklist page={cfg.page} title="Coursework — final checklist" /> },
          ]} />
        </section>
      )}

      {cfg.hasFocusUnits && (
        <>
          <nav aria-label="On this page" className="pb-8 flex flex-wrap gap-2">
            {[['focus-units', 'Focus units & revision'], ['textbooks', 'Textbooks'], ['resources', 'Resources']].map(([id, label]) => (
              <button key={id} onClick={() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="min-h-[40px] rounded-full border border-border px-4 text-sm font-bold hover:border-[#1D4ED8] hover:text-[#1D4ED8]">
                {label}
              </button>
            ))}
          </nav>
          <IgcseFocusUnits page={cfg.page} title="Focus units" description="Open a focus unit to see what you need to know and its revision notes. Tick off each revision topic as you go." />
        </>
      )}

      <SectionCanvas page={cfg.page} />

      {cfg.exam === 'paper1' && (
        <IgcsePaper1Exam
          section={cfg.page}
          title="Paper 1"
          description="The knowledge-based paper — how to approach each question type, a bank of practice questions, and reveal-the-mark-scheme study."
        />
      )}
      {cfg.exam === 'paper2' && (
        <>
          <IgcsePaper2Focus
            title="Topic focus by year"
            description="The topic focus changes each year — the most recent year is shown at the top."
          />
          <IgcsePaper2Links
            section={cfg.page}
            title="Paper 2"
            description="The source-based paper — pick a topic, then open the paper and its mark scheme."
          />
        </>
      )}
      {cfg.hasTextbook && <div id="textbooks" className="scroll-mt-28"><TextbookSection section={cfg.page} caseStudy="all" /></div>}

      {cfg.exam !== 'paper1' && <div id="resources" className="scroll-mt-28"><ResourceLibrary section={cfg.page} /></div>}
    </div>
  );
}