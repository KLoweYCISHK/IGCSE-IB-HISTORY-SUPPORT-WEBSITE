import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import ArchiveTable from '@/components/ArchiveTable';

export default function ExamMarkSchemeList({ items, editMode, onEdit, onDelete }) {
  if (items.length === 0) return <p className="text-foreground/40 italic">No mark schemes added yet.</p>;
  return (
    <Accordion type="single" collapsible className="border-t border-border">
      {items.map((item, i) => (
        <AccordionItem key={item.id} value={item.id} className="border-b border-border">
          <AccordionTrigger className="text-left hover:no-underline py-6">
            <span className="flex items-baseline gap-4">
              <span className="font-mono text-xs text-[#6F551A]">{String(i + 1).padStart(2, '0')}</span>
              <span className="font-display text-2xl leading-snug">{item.question}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent className="pb-10">
            {item.mark_scheme_rows?.length
              ? <ArchiveTable rows={item.mark_scheme_rows} />
              : <p className="text-foreground/40 italic">No mark scheme yet.</p>}
            {editMode && (
              <div className="mt-6 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(item)}><Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => onDelete(item.id)}><Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete</Button>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}