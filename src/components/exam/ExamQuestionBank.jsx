import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';

const PAPER2_TYPES = [
  { value: '6_marker', label: '6 Markers' },
  { value: '4_marker', label: '4 Markers' },
  { value: '15_marker', label: '15 Markers' },
];

function FilterPill({ active, children, last, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${last ? '' : 'border-r border-border'} ${active ? 'bg-foreground text-background' : 'hover:bg-black/[0.04]'}`}
    >
      {children}
    </button>
  );
}

export default function ExamQuestionBank({ items, section, editMode, onEdit, onDelete }) {
  const [qType, setQType] = useState('all');
  const [topic, setTopic] = useState('all');

  const topics = useMemo(() => {
    const set = new Set();
    items.forEach((i) => { if (i.topic) set.add(i.topic); });
    return Array.from(set).sort();
  }, [items]);

  const filtered = items.filter((i) => {
    if (qType !== 'all' && (i.question_type || '') !== qType) return false;
    if (topic !== 'all' && (i.topic || '') !== topic) return false;
    return true;
  });

  if (items.length === 0) return <p className="text-foreground/40 italic">No exam questions added yet.</p>;

  return (
    <div>
      {(section === 'paper2' || topics.length > 0) && (
        <div className="flex flex-wrap gap-3 mb-8">
          {section === 'paper2' && (
            <div className="inline-flex border border-border rounded-sm overflow-hidden">
              <FilterPill active={qType === 'all'} onClick={() => setQType('all')}>All</FilterPill>
              {PAPER2_TYPES.map((t, idx) => (
                <FilterPill key={t.value} active={qType === t.value} last={idx === PAPER2_TYPES.length - 1} onClick={() => setQType(t.value)}>
                  {t.label}
                </FilterPill>
              ))}
            </div>
          )}
          {topics.length > 0 && (
            <div className="inline-flex border border-border rounded-sm overflow-hidden">
              <FilterPill active={topic === 'all'} onClick={() => setTopic('all')}>All topics</FilterPill>
              {topics.map((t, idx) => (
                <FilterPill key={t} active={topic === t} last={idx === topics.length - 1} onClick={() => setTopic(t)}>
                  {t}
                </FilterPill>
              ))}
            </div>
          )}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-foreground/40 italic">No questions match these filters.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((item, i) => (
            <div key={item.id} className="border border-border rounded-sm p-6 bg-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-baseline gap-4">
                  <span className="font-mono text-xs text-[#6F551A]">{String(i + 1).padStart(2, '0')}</span>
                  <h4 className="font-display text-xl leading-snug">{item.question}</h4>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0 justify-end">
                  {item.question_type && (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded px-2 py-1">
                      {item.question_type.replace('_', ' ')}
                    </span>
                  )}
                  {item.topic && (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded px-2 py-1">
                      {item.topic}
                    </span>
                  )}
                </div>
              </div>
              {editMode && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => onEdit(item)}><Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => onDelete(item.id)}><Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}