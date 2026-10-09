import React from 'react';
import PageHero from '@/components/PageHero';
import SectionHeading from '@/components/SectionHeading';
import Roadmap from '@/components/Roadmap';
import SectionCanvas from '@/components/SectionCanvas';
import DocumentSection from '@/components/DocumentSection';
import FinalChecklist from '@/components/FinalChecklist';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

const tabCls = "rounded-none border-r border-border last:border-r-0 px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] data-[state=active]:bg-[#6F551A] data-[state=active]:text-[#F4EFE3] data-[state=inactive]:text-foreground/60 data-[state=inactive]:hover:bg-black/[0.04]";

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
        <SectionHeading eyebrow="The roadmap" title="Step by step" description="Work through each stage in turn." />
        <Tabs defaultValue="preparing">
          <TabsList className="inline-flex flex-wrap h-auto bg-transparent p-0 border border-border rounded-sm overflow-hidden">
            <TabsTrigger value="preparing" className={tabCls}>Preparing</TabsTrigger>
            <TabsTrigger value="writing" className={tabCls}>Writing</TabsTrigger>
            <TabsTrigger value="markscheme" className={tabCls}>Mark scheme</TabsTrigger>
            <TabsTrigger value="checklist" className={tabCls}>Final checklist</TabsTrigger>
          </TabsList>
          <TabsContent value="preparing" className="mt-8">
            <Roadmap section="ia" stages={[{ key: 'preparing', label: 'Preparing' }]} />
          </TabsContent>
          <TabsContent value="writing" className="mt-8">
            <Roadmap section="ia" stages={[{ key: 'writing', label: 'Writing' }]} />
          </TabsContent>
          <TabsContent value="markscheme" className="mt-8">
            <DocumentSection section="ia" title="Example IAs" description="Annotated example IAs — download them and study the marking." embedded />
          </TabsContent>
          <TabsContent value="checklist" className="mt-8">
            <FinalChecklist page="ia" title="IA — final checklist" />
          </TabsContent>
        </Tabs>
      </section>

      <SectionCanvas page="ia" />
    </div>
  );
}