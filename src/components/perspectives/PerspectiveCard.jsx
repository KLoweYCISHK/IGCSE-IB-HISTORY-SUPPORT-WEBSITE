import React from 'react';
import Highlight from '@/lib/highlight';
import { ExternalLink, Pencil, Trash2 } from 'lucide-react';

export default function PerspectiveCard({ item, query, canManage, onEdit, onDelete }) {
  return (
    <article className="glassine group relative border border-border bg-card rounded-sm p-6 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <h4 className="font-body font-semibold text-lg tracking-tight">
          <Highlight text={item.name} query={query} />
        </h4>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-[#6F551A] border border-[#6F551A]/60 rounded-full px-3 py-1">
          <Highlight text={item.topic} query={query} />
        </span>
      </div>

      <p className="mt-4 font-display text-xl leading-[1.45] text-foreground/90">
        <Highlight text={item.argument} query={query} />
      </p>

      {(item.source_url || item.source_text) && (
        <div className="mt-5 pt-4 border-t border-border/70 space-y-1.5">
          {item.source_text && (
            <p className="text-sm text-foreground/50"><Highlight text={item.source_text} query={query} /></p>
          )}
          {item.source_url && (
            <a href={item.source_url} target="_blank" rel="noreferrer" title={item.source_url}
              className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#6F551A] inline-flex items-center gap-1.5">
              Source <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      )}

      <p className="mt-4 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
        added by {item.student_name || 'anonymous'}
      </p>

      {canManage && (
        <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition bg-card border border-border rounded">
          <button onClick={onEdit} className="p-1.5 hover:text-[#6F551A]"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} className="p-1.5 hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </article>
  );
}