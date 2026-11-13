import React, { useRef, useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ChevronRight, ArrowRight } from 'lucide-react';

// The stages of a long task (Preparing, Writing, ...) as a numbered flow students move along.
// stages = [{ value, label, content }]
export default function StageFlow({ stages }) {
  const [value, setValue] = useState(stages[0].value);
  const top = useRef(null);
  const go = (v) => { setValue(v); top.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  return (
    <Tabs value={value} onValueChange={setValue}>
      <div ref={top} className="scroll-mt-28" />
      <TabsList aria-label="Stages" className="flex flex-wrap justify-start items-center h-auto gap-x-1 gap-y-2 bg-transparent p-0 text-foreground">
        {stages.map((s, i) => (
          <React.Fragment key={s.value}>
            <TabsTrigger value={s.value}
              className="group gap-2 min-h-[48px] rounded-full border-2 border-border pl-2 pr-5 py-0 text-[15px] font-bold whitespace-normal text-left hover:border-[#1D4ED8] data-[state=active]:border-[#1D4ED8] data-[state=active]:bg-[#1D4ED8] data-[state=active]:text-white data-[state=active]:shadow-none">
              <span className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm bg-[#1D4ED8] text-white group-data-[state=active]:bg-white group-data-[state=active]:text-[#1D4ED8]">{i + 1}</span>
              {s.label}
            </TabsTrigger>
            {i < stages.length - 1 && <ChevronRight className="w-5 h-5 shrink-0 text-foreground/40" aria-hidden="true" />}
          </React.Fragment>
        ))}
      </TabsList>

      {stages.map((s, i) => {
        const next = stages[i + 1];
        return (
          <TabsContent key={s.value} value={s.value} className="mt-8">
            {s.content}
            {next && (
              <div className="mt-8 flex justify-end">
                <button onClick={() => go(next.value)} className="inline-flex items-center gap-2 min-h-[48px] rounded-full bg-[#1D4ED8] px-6 font-bold text-white hover:bg-[#1E40AF]">
                  Next stage: {next.label} <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
