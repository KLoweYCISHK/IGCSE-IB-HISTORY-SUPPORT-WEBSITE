import React from 'react';
import PageHero from '@/components/PageHero';
import SectionHeading from '@/components/SectionHeading';
import Roadmap from '@/components/Roadmap';
import SectionCanvas from '@/components/SectionCanvas';
import BlockCanvas from '@/components/BlockCanvas';
import DocumentSection from '@/components/DocumentSection';
import StageFlow from '@/components/StageFlow';


export default function EE() {
  return (
    <div>
      <PageHero
        page="ee"
        eyebrow="Extended Essay · 4,000 words"
        title="The EE"
        lede="A sustained piece of independent research. Here is the path through it."
        image="https://media.base44.com/images/public/6a9374897e9609e0d36beee4/1f8d21ab1_generated_d03ed05f.png"
      />

      <section className="py-12 md:py-16 border-t border-border">
        <SectionHeading eyebrow="The roadmap" title="Step by step" description="Follow the stages in order. Open a step, work through it, then tick it off." />
        <StageFlow stages={[
          { value: 'preparing', label: 'Preparing', content: <Roadmap section="ee" stages={[{ key: 'preparing', label: 'Preparing' }]} /> },
          { value: 'writing', label: 'Writing', content: <Roadmap section="ee" stages={[{ key: 'writing', label: 'Writing' }]} /> },
          { value: 'reflection', label: 'Reflection', content: <Roadmap section="ee" stages={[{ key: 'reflection', label: 'Reflection' }]} /> },
          { value: 'examples', label: 'Examples', content: <DocumentSection section="ee" title="Example EEs" description="Annotated example Extended Essays — download and study them." embedded /> },
          { value: 'markscheme', label: 'Mark scheme', content: (
            <>
              <BlockCanvas section="ee" sub="student_markscheme" emptyLabel="No mark scheme added yet." />
              <div className="mt-12">
                <SectionCanvas page="ee" filterFn={(s) => s.slug.startsWith('criteria_')} />
              </div>
            </>
          ) },
        ]} />
      </section>

      <SectionCanvas page="ee" filterFn={(s) => !s.slug.startsWith('criteria_')} />
    </div>
  );
}