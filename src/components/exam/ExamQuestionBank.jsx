import React, { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import DoneTick, { DoneCount } from '@/components/DoneTick';

const PAPER2_TYPES = [
  { value: '6_marker', label: '6 Markers' },
  { value: '4_marker', label: '4 Markers' },
  { value: '15_marker', label: '15 Markers' },
];
// On Paper 2 only these question types are split by topic (the lines of inquiry, e.g. "emergence").
const TOPIC_TYPES = ['4_marker', '15_marker'];
const NONE = '__none';
const topicKey = (t) => String(t || '').trim().toLowerCase();

function FilterPill({ active, children, last, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${last ? '' : 'border-r border-border'} ${active ? 'bg-foreground text-background' : 'hover:bg-black/[0.04]'}`}
    >
      {children}
    </button>
  );
}

export default function ExamQuestionBank({ items, section, editMode, onEdit, onDelete }) {
  const isPaper2 = section === 'paper2';
  const [qType, setQType] = useState('6_marker');
  const [topic, setTopic] = useState(null);

  // Paper 2: students choose a question type; there is no "all questions" view.
  // Questions saved without a type sit under "Other" so none go missing.
  const types = useMemo(() => {
    if (!isPaper2) return [];
    const known = PAPER2_TYPES.map((t) => t.value);
    return items.some((i) => !known.includes(i.question_type)) ? [...PAPER2_TYPES, { value: NONE, label: 'Other' }] : PAPER2_TYPES;
  }, [items, isPaper2]);
  const typeOf = (i) => (PAPER2_TYPES.some((t) => t.value === i.question_type) ? i.question_type : NONE);
  const ofType = isPaper2 ? items.filter((i) => typeOf(i) === qType) : items;

  // Topics are whatever the teacher has typed on the questions, in the order they were first used.
  const byTopic = !isPaper2 || TOPIC_TYPES.includes(qType);
  const topics = useMemo(() => {
    if (!byTopic) return [];
    const seen = new Map();
    ofType.forEach((i) => { const k = topicKey(i.topic); if (k && !seen.has(k)) seen.set(k, i.topic.trim()); });
    const list = [...seen].map(([value, label]) => ({ value, label }));
    return list.length && ofType.some((i) => !topicKey(i.topic)) ? [...list, { value: NONE, label: 'Other' }] : list;
  }, [ofType, byTopic]);
  const current = topics.some((t) => t.value === topic) ? topic : topics[0]?.value;
  const shown = topics.length ? ofType.filter((i) => (topicKey(i.topic) || NONE) === current) : ofType;

  if (items.length === 0) return <p className="text-foreground/40 italic">No exam questions added yet.</p>;

  return (
    <div>
      {(isPaper2 || topics.length > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {isPaper2 && (
            <div className="inline-flex flex-wrap border border-border rounded-sm overflow-hidden">
              {types.map((t, idx) => (
                <FilterPill key={t.value} active={qType === t.value} last={idx === types.length - 1} onClick={() => setQType(t.value)}>
                  {t.label}
                </FilterPill>
              ))}
            </div>
          )}
          {topics.length > 0 && (
            <div className="inline-flex flex-wrap border border-border rounded-sm overflow-hidden">
              {topics.map((t, idx) => (
                <FilterPill key={t.value} active={current === t.value} last={idx === topics.length - 1} onClick={() => setTopic(t.value)}>
                  {t.label}
                </FilterPill>
              ))}
            </div>
          )}
        </div>
      )}

      {editMode && byTopic && (
        <p className="mb-6 text-sm text-foreground/60">
          Topic filters: edit a question and type its topic (for example "Emergence"). Each topic you use becomes a filter button here for students.
        </p>
      )}

      {shown.length === 0 ? (
        <p className="text-foreground/40 italic">No questions added here yet.</p>
      ) : (
        <>
          <DoneCount ids={shown.map((i) => i.id)} />
          <div className="space-y-4">
            {shown.map((item, i) => (
              <div key={item.id} className="border border-border rounded-sm p-6 bg-card">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-baseline gap-4">
                    <span className="font-mono text-xs text-[#1D4ED8]">{String(i + 1).padStart(2, '0')}</span>
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
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <DoneTick id={item.id} />
                  {editMode && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => onEdit(item)}><Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit</Button>
                      <Button size="sm" variant="ghost" onClick={() => onDelete(item.id)}><Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete</Button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
