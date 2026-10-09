import React, { useState } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, ChevronRight } from 'lucide-react';
import { stripPasteArtifacts } from '@/lib/sanitizeHtml';

function ApproachBody({ item, editMode, onEdit, onDelete }) {
  const [showExample, setShowExample] = useState(false);
  return (
    <div className="pb-10">
      <div>
        <p className="chrono-eyebrow mb-3">How to approach it</p>
        <div className="prose-archive break-words" dangerouslySetInnerHTML={{ __html: stripPasteArtifacts(item.approach) || '<p>—</p>' }} />
      </div>

      <Collapsible open={showExample} onOpenChange={setShowExample} className="mt-8 border-t border-border pt-6">
        <CollapsibleTrigger asChild>
          <button className="group inline-flex items-center gap-2 text-sm font-medium text-[#6F551A] hover:text-[#5A4514]">
            <ChevronRight className={`w-4 h-4 transition-transform ${showExample ? 'rotate-90' : ''}`} />
            {showExample ? 'Hide annotated example' : 'View annotated example'}
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 data-[state=open]:animate-in data-[state=open]:fade-in-0">
          <p className="chrono-eyebrow mb-3">Annotated example</p>
          <div className="prose-archive break-words" dangerouslySetInnerHTML={{ __html: stripPasteArtifacts(item.example) || '<p>—</p>' }} />
        </CollapsibleContent>
      </Collapsible>

      {editMode && (
        <div className="mt-6 flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onEdit(item)}><Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit</Button>
          <Button size="sm" variant="ghost" onClick={() => onDelete(item.id)}><Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete</Button>
        </div>
      )}
    </div>
  );
}

export default function ExamApproachList({ items, editMode, onEdit, onDelete }) {
  if (items.length === 0) return <p className="text-foreground/40 italic">No approach guidance added yet.</p>;
  return (
    <Accordion type="single" collapsible className="border-t border-border">
      {items.map((item, i) => (
        <AccordionItem key={item.id} value={item.id} className="border-b border-border">
          <AccordionTrigger className="text-left hover:no-underline py-6">
            <span className="flex items-baseline gap-4">
              <span className="font-mono text-xs text-[#6F551A]">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display text-2xl leading-snug">{item.question}</span>
              {item.time_minutes != null && (
                <span className="shrink-0 self-center whitespace-nowrap rounded-full border border-[#6F551A]/30 bg-[#6F551A]/10 px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-wider text-[#6F551A]">{item.time_minutes} min</span>
              )}
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <ApproachBody item={item} editMode={editMode} onEdit={onEdit} onDelete={onDelete} />
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}