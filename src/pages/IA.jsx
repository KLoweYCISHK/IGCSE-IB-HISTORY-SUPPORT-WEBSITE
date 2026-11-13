import React from 'react';
import PageHero from '@/components/PageHero';
import SectionHeading from '@/components/SectionHeading';
import Roadmap from '@/components/Roadmap';
import SectionCanvas from '@/components/SectionCanvas';
import DocumentSection from '@/components/DocumentSection';
import FinalChecklist from '@/components/FinalChecklist';
import StageFlow from '@/components/StageFlow';


export default function IA() {
  return (
    <div>
      <PageHero
        page="ia"
        eyebrow="Internal Assessment · 20% of your grade"
        title="The IA"
        lede="A historical investigation of your own making. Follow the roadmap, step by step."
        image="https://media.base44.com/images/public/6a9374897e9609e0d36beee4/6b4c80657_generated_4d0d7cf5.png"
      />

      <section className="py-12 md:py-16 border-t border-border">
        <SectionHeading eyebrow="The roadmap" title="Step by step" description="Follow the stages in order. Open a step, work through it, then tick it off." />
        <StageFlow stages={[
          { value: 'preparing', label: 'Preparing', content: <Roadmap section="ia" stages={[{ key: 'preparing', label: 'Preparing' }]} /> },
          { value: 'writing', label: 'Writing', content: <Roadmap section="ia" stages={[{ key: 'writing', label: 'Writing' }]} /> },
          { value: 'markscheme', label: 'Mark scheme', content: <DocumentSection section="ia" title="Example IAs" description="Annotated example IAs — download them and study the marking." embedded /> },
          { value: 'checklist', label: 'Final checklist', content: <FinalChecklist page="ia" title="IA — final checklist" /> },
        ]} />
      </section>

      <SectionCanvas page="ia" />
    </div>
  );
}