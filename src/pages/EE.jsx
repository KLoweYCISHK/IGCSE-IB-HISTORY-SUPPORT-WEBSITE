import React from 'react';
import PageHero from '@/components/PageHero';
import SectionHeading from '@/components/SectionHeading';
import Roadmap from '@/components/Roadmap';
import SectionCanvas from '@/components/SectionCanvas';
import BlockCanvas from '@/components/BlockCanvas';
import DocumentSection from '@/components/DocumentSection';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const tabCls = "rounded-none border-r border-border last:border-r-0 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] data-[state=active]:bg-[#6F551A] data-[state=active]:text-[#F4EFE3] data-[state=inactive]:text-foreground/60 data-[state=inactive]:hover:bg-black/[0.04]";

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
        <SectionHeading eyebrow="The roadmap" title="Step by step" description="Work through each stage in turn." />
        <Tabs defaultValue="preparing">
          <TabsList className="inline-flex flex-wrap h-auto bg-transparent p-0 border border-border rounded-sm overflow-hidden">
            <TabsTrigger value="preparing" className={tabCls}>Preparing</TabsTrigger>
            <TabsTrigger value="writing" className={tabCls}>Writing</TabsTrigger>
            <TabsTrigger value="reflection" className={tabCls}>Reflection</TabsTrigger>
            <TabsTrigger value="examples" className={tabCls}>Examples</TabsTrigger>
            <TabsTrigger value="markscheme" className={tabCls}>Mark scheme</TabsTrigger>
          </TabsList>
          <TabsContent value="preparing" className="mt-8">
            <Roadmap section="ee" stages={[{ key: 'preparing', label: 'Preparing' }]} />
          </TabsContent>
          <TabsContent value="writing" className="mt-8">
            <Roadmap section="ee" stages={[{ key: 'writing', label: 'Writing' }]} />
          </TabsContent>
          <TabsContent value="reflection" className="mt-8">
            <Roadmap section="ee" stages={[{ key: 'reflection', label: 'Reflection' }]} />
          </TabsContent>
          <TabsContent value="examples" className="mt-8">
            <DocumentSection section="ee" title="Example EEs" description="Annotated example Extended Essays — download and study them." embedded />
          </TabsContent>
          <TabsContent value="markscheme" className="mt-8">
            <BlockCanvas section="ee" sub="student_markscheme" emptyLabel="No mark scheme added yet." />
            <div className="mt-12">
              <SectionCanvas page="ee" filterFn={(s) => s.slug.startsWith('criteria_')} />
            </div>
          </TabsContent>
        </Tabs>
      </section>

      <SectionCanvas page="ee" filterFn={(s) => !s.slug.startsWith('criteria_')} />
    </div>
  );
}