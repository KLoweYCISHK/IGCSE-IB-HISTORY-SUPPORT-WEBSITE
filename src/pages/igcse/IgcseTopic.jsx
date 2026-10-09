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
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

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

const tabCls = 'rounded-none border-r border-border last:border-r-0 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] data-[state=active]:bg-[#6F551A] data-[state=active]:text-[#F4EFE3] data-[state=inactive]:text-foreground/60 data-[state=inactive]:hover:bg-black/[0.04]';

export default function IgcseTopic() {
  const { topic } = useParams();
  const cfg = TOPICS[topic];
  if (!cfg) return <Navigate to="/" replace />;

  return (
    <div>
      <PageHero page={cfg.page} eyebrow={cfg.eyebrow} title={cfg.title} lede={cfg.lede} />

      {cfg.isCoursework && (
        <section className="py-12 md:py-16 border-t border-border">
          <SectionHeading eyebrow="The roadmap" title="Step by step" description="Work through each stage in turn." />
          <Tabs defaultValue="preparing">
            <TabsList className="inline-flex flex-wrap h-auto bg-transparent p-0 border border-border rounded-sm overflow-hidden">
              <TabsTrigger value="preparing" className={tabCls}>Preparing</TabsTrigger>
              <TabsTrigger value="writing" className={tabCls}>Writing</TabsTrigger>
              <TabsTrigger value="markscheme" className={tabCls}>Examples</TabsTrigger>
              <TabsTrigger value="checklist" className={tabCls}>Final checklist</TabsTrigger>
            </TabsList>
            <TabsContent value="preparing" className="mt-8">
              <Roadmap section={cfg.page} stages={[{ key: 'preparing', label: 'Preparing' }]} />
            </TabsContent>
            <TabsContent value="writing" className="mt-8">
              <Roadmap section={cfg.page} stages={[{ key: 'writing', label: 'Writing' }]} />
            </TabsContent>
            <TabsContent value="markscheme" className="mt-8">
              <DocumentSection
                section={cfg.page}
                title="Example coursework"
                description="Annotated examples — download them and study the marking."
                embedded
              />
            </TabsContent>
            <TabsContent value="checklist" className="mt-8">
              <FinalChecklist page={cfg.page} title="Coursework — final checklist" />
            </TabsContent>
          </Tabs>
        </section>
      )}

      {cfg.hasFocusUnits && (
        <IgcseFocusUnits page={cfg.page} title="Focus units" description="The inquiry questions and key points for this unit — these become the topics in the Paper 1 question bank." />
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
      {cfg.hasTextbook && <TextbookSection section={cfg.page} caseStudy="all" />}

      {cfg.exam !== 'paper1' && <ResourceLibrary section={cfg.page} />}
    </div>
  );
}