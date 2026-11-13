import React, { useState } from 'react';
import Highlight from '@/lib/highlight';
import { ExternalLink, Pencil, Trash2, Star, PenLine, Copy, Check, Columns2 } from 'lucide-react';
import { schoolOf, schoolStyle, essayStarters } from '@/lib/perspectiveTopics';
import { toggle, useProgress } from '@/lib/progress';

export function SchoolTag({ item }) {
  const school = schoolOf(item);
  if (!school) return null;
  return (
    <span className={`inline-block rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${schoolStyle(item.unit, school)}`}>
      {school}
    </span>
  );
}

export function EssayStarters({ item }) {
  const [copied, setCopied] = useState(null);
  const copy = async (text, i) => {
    try { await navigator.clipboard.writeText(text); setCopied(i); window.setTimeout(() => setCopied(null), 1500); } catch { /* clipboard blocked */ }
  };
  return (
    <ul className="space-y-2">
      {essayStarters(item).map((s, i) => (
        <li key={i} className="flex items-start justify-between gap-3 rounded-lg bg-background border border-border px-3 py-2 text-sm">
          <span>{s}</span>
          <button onClick={() => copy(s, i)} aria-label="Copy sentence starter" className="shrink-0 p-1.5 rounded text-[#1D4ED8] hover:bg-[#1D4ED8]/10">
            {copied === i ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </li>
      ))}
    </ul>
  );
}

export default function PerspectiveCard({ item, query = '', canManage, onEdit, onDelete, comparing, onCompare }) {
  const { saved } = useProgress();
  const [open, setOpen] = useState(false);
  const isSaved = !!saved[item.id];

  return (
    <article className={`relative flex flex-col gap-3 border bg-card rounded-sm p-6 ${comparing ? 'border-[#1D4ED8] ring-2 ring-[#1D4ED8]/30' : 'border-border'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <SchoolTag item={item} />
          <span className="inline-block rounded-full border border-border px-3 py-1 text-[11px] font-semibold text-foreground/70">
            <Highlight text={item.topic} query={query} />
          </span>
        </div>
        <button
          onClick={() => toggle('saved', item.id)}
          aria-pressed={isSaved}
          aria-label={isSaved ? 'Remove from my essay toolkit' : 'Save to my essay toolkit'}
          title={isSaved ? 'Saved to my essay toolkit' : 'Save to my essay toolkit'}
          className={`shrink-0 w-11 h-11 rounded-full border flex items-center justify-center transition-colors ${isSaved ? 'bg-[#1D4ED8] border-[#1D4ED8] text-white' : 'border-border text-[#1D4ED8] hover:bg-[#1D4ED8]/10'}`}
        >
          <Star className="w-4 h-4" fill={isSaved ? 'currentColor' : 'none'} />
        </button>
      </div>

      <h4 className="font-display text-2xl leading-tight"><Highlight text={item.name} query={query} /></h4>

      <p className="text-[16px] leading-relaxed text-foreground/90"><Highlight text={item.argument} query={query} /></p>

      {(item.source_url || item.source_text) && (
        <div className="text-sm text-foreground/60 space-y-1">
          {item.source_text && <p><Highlight text={item.source_text} query={query} /></p>}
          {item.source_url && (
            <a href={item.source_url} target="_blank" rel="noreferrer" title={item.source_url} className="inline-flex items-center gap-1.5 font-semibold text-[#1D4ED8]">
              Source <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      <div className="mt-auto pt-2 flex flex-wrap gap-2">
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open}
          className="inline-flex items-center gap-1.5 min-h-[40px] rounded-full bg-[#1D4ED8]/10 px-4 text-sm font-semibold text-[#1E40AF] hover:bg-[#1D4ED8]/20">
          <PenLine className="w-4 h-4" /> Use it in an essay
        </button>
        {onCompare && (
          <button onClick={onCompare} aria-pressed={!!comparing}
            className={`inline-flex items-center gap-1.5 min-h-[40px] rounded-full border px-4 text-sm font-semibold ${comparing ? 'bg-[#1D4ED8] border-[#1D4ED8] text-white' : 'border-border text-foreground/70 hover:border-[#1D4ED8]'}`}>
            <Columns2 className="w-4 h-4" /> {comparing ? 'Comparing' : 'Compare'}
          </button>
        )}
      </div>

      {open && <EssayStarters item={item} />}

      <p className="text-xs text-muted-foreground">Added by {item.student_name || 'anonymous'}</p>

      {canManage && (
        <div className="absolute -top-3 right-4 flex gap-1 bg-background border border-border rounded">
          <button onClick={onEdit} aria-label="Edit perspective" className="p-1.5 hover:text-[#1D4ED8]"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={onDelete} aria-label="Delete perspective" className="p-1.5 hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      )}
    </article>
  );
}
