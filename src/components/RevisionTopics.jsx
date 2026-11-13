import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { useProgress } from '@/lib/progress';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, ChevronDown, Check, ArrowRight } from 'lucide-react';
import SectionHeading from './SectionHeading';
import SectionCanvas from './SectionCanvas';
import RevisedTick from './RevisedTick';
import ProgressTransfer from './ProgressTransfer';
import SectionForm from './editor/SectionForm';

// Revision notes for the IB paper pages.
// A revision topic is a card (stored as a section on "<page>_revtopics", module = case study or unit).
// Its notes are subsections (stored on "<page>_revision", module = the topic's id).
function useRevisionData(page) {
  const [topics, setTopics] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const [t, n] = await Promise.all([
        store.entities.PageSection.filter({ page: `${page}_revtopics` }, 'order'),
        store.entities.PageSection.filter({ page: `${page}_revision` }),
      ]);
      setTopics(t.filter((s) => !s.is_deleted));
      setNotes(n.filter((s) => !s.is_deleted));
    } catch { setTopics([]); setNotes([]); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => {
    load();
    window.addEventListener('archive:reload', load);
    return () => window.removeEventListener('archive:reload', load);
  }, [load]);

  return { topics, notes, loading, load };
}

function Bar({ done, total, label }) {
  return (
    <div className="h-2.5 rounded-full bg-border overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label={label}>
      <div className="h-full bg-[#1D4ED8] transition-all" style={{ width: `${total ? (done / total) * 100 : 0}%` }} />
    </div>
  );
}

// Shown on the "all case studies" view: one button per case study, with its progress.
export function RevisionCaseList({ page, cases, onPick }) {
  const { topics, notes, loading } = useRevisionData(page);
  const { revised } = useProgress();
  if (loading) return null;

  return (
    <section className="py-12 md:py-16 border-t border-border">
      <SectionHeading eyebrow="Revision notes" title="Revise by case study" description="Choose a case study to open its revision topics and tick them off as you go." />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cases.map((c) => {
          const ids = topics.filter((t) => t.module === c.value).map((t) => t.id);
          const mine = notes.filter((n) => ids.includes(n.module));
          const done = mine.filter((n) => revised[n.id]).length;
          return (
            <button key={c.value} onClick={() => onPick(c.value)}
              className="glassine text-left rounded-sm border border-border bg-card p-6 hover:border-[#1D4ED8] space-y-3">
              <span className="block font-display text-2xl leading-tight">{c.label}</span>
              <span className="block text-sm text-foreground/70">
                {mine.length === 0 ? 'Revision notes coming soon' : `${done} of ${mine.length} revision topic${mine.length === 1 ? '' : 's'} revised`}
              </span>
              {mine.length > 0 && <Bar done={done} total={mine.length} label={`${c.label} revision topics revised`} />}
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-[#1D4ED8]">Open <ArrowRight className="w-4 h-4" /></span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default function RevisionTopics({ page, scope, scopeLabel }) {
  const { editMode } = useAdmin();
  const { revised } = useProgress();
  const { topics: allTopics, notes, loading, load } = useRevisionData(page);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState({});

  const topics = useMemo(() => allTopics.filter((t) => t.module === scope), [allTopics, scope]);
  const counts = useMemo(() => Object.fromEntries(topics.map((t) => {
    const mine = notes.filter((n) => n.module === t.id);
    return [t.id, { total: mine.length, done: mine.filter((n) => revised[n.id]).length }];
  })), [topics, notes, revised]);
  const total = topics.reduce((n, t) => n + counts[t.id].total, 0);
  const done = topics.reduce((n, t) => n + counts[t.id].done, 0);

  const save = async (draft) => {
    const { id, ...data } = draft;
    if (id) await editDb.PageSection.update(id, data);
    else await editDb.PageSection.create({ ...data, slug: `${scope}__${data.slug}`, page: `${page}_revtopics`, module: scope, order: topics.length });
    setEditing(null);
    load();
  };
  const move = async (index, dir) => {
    const target = topics[index + dir];
    if (!target) return;
    await editDb.PageSection.bulkUpdate([
      { id: topics[index].id, order: index + dir },
      { id: target.id, order: index },
    ]);
    load();
  };
  const remove = async (t) => { await editDb.PageSection.update(t.id, { is_deleted: true }); load(); };

  if (loading) return <div className="h-24 animate-pulse bg-black/[0.04] rounded my-12" />;
  // superseded by focus units; kept so that any topics already added still show
  if (topics.length === 0) return null;

  return (
    <section id="revision" className="py-12 md:py-16 border-t border-border scroll-mt-28">
      <SectionHeading
        eyebrow="Revision notes"
        title={scopeLabel ? `Revise: ${scopeLabel}` : 'Revision topics'}
        description="Open a topic to see its revision notes. Tick off each one as you revise it."
        right={editMode ? (
          <Button variant="outline" size="sm" onClick={() => setEditing({})}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add revision topic
          </Button>
        ) : null}
      />

      {total > 0 && (
        <div className="mb-6 rounded-sm bg-card border border-border p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold">{done} of {total} revision topics revised</p>
            <ProgressTransfer />
          </div>
          <Bar done={done} total={total} label="Revision topics revised" />
          <p className="text-sm text-muted-foreground">Your ticks are saved on this device. No login needed.</p>
        </div>
      )}

      {editMode && (
        <div className="mb-6 rounded-sm border border-dashed border-[#1D4ED8] bg-[#1D4ED8]/5 p-5 text-sm space-y-1">
          <p className="font-bold">Adding revision notes (only you see this)</p>
          <p>Use "Add revision topic" for each topic{scopeLabel ? ` in ${scopeLabel}` : ''}. Open the topic and use "Add revision subsection", then add text, images, files or links inside it as usual.</p>
          <p>Students get a "Mark as revised" tick on every subsection. Any two-column table (term and meaning, date and event) also gets a "Test yourself with flashcards" button.</p>
          <p>Key words: select a word in your saved notes and click "Make key word" to give it a meaning and Simplified Chinese. It is then highlighted everywhere it appears, and students click it to see the pop-up.</p>
        </div>
      )}

      <div className="space-y-4">
        {topics.map((t, i) => {
          const isOpen = !!open[t.id];
          const c = counts[t.id];
          const allDone = c.total > 0 && c.done === c.total;
          return (
            <div key={t.id} className={`rounded-sm border bg-card ${isOpen ? 'border-[#1D4ED8]' : 'border-border'}`}>
              <div className="flex items-stretch">
                <button onClick={() => setOpen((o) => ({ ...o, [t.id]: !o[t.id] }))} aria-expanded={isOpen} aria-controls={`rev-topic-${t.id}`}
                  className="flex-1 min-w-0 flex items-center gap-4 p-5 md:p-6 text-left">
                  <span className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-display text-lg text-white ${allDone ? 'bg-teal-700' : 'bg-[#1D4ED8]'}`}>
                    {allDone ? <Check className="w-5 h-5" aria-label="All revised" /> : i + 1}
                  </span>
                  <span className="flex-1 min-w-0">
                    {t.eyebrow && <span className="block chrono-eyebrow mb-1">{t.eyebrow}</span>}
                    <span className="block font-display text-xl md:text-2xl leading-snug">{t.title}</span>
                    <span className="mt-1.5 block text-sm font-semibold text-[#1E40AF]">
                      {c.total === 0 ? 'Revision notes coming soon' : `${c.done} of ${c.total} revision topic${c.total === 1 ? '' : 's'} revised`}
                    </span>
                  </span>
                  <ChevronDown className={`shrink-0 w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                {editMode && (
                  <div className="flex items-center gap-1 pr-3">
                    <button onClick={() => move(i, -1)} aria-label="Move topic up" className="p-1.5 hover:text-[#1D4ED8]"><ArrowUp className="w-4 h-4" /></button>
                    <button onClick={() => move(i, 1)} aria-label="Move topic down" className="p-1.5 hover:text-[#1D4ED8]"><ArrowDown className="w-4 h-4" /></button>
                    <button onClick={() => setEditing(t)} aria-label="Edit topic" className="p-1.5 hover:text-[#1D4ED8]"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => remove(t)} aria-label="Delete topic" className="p-1.5 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                  </div>
                )}
              </div>
              {isOpen && (
                <div id={`rev-topic-${t.id}`} className="border-t border-border p-5 md:p-6">
                  <SectionCanvas
                    page={`${page}_revision`}
                    module={t.id}
                    compact
                    scopeSlugs
                    tableFlashcards
                    keyTerms
                    addLabel="Add revision subsection"
                    onChange={load}
                    sectionAction={(s) => <RevisedTick id={s.id} small />}
                    empty={!editMode && <p className="text-foreground/60">Revision notes for this topic are on their way.</p>}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      <SectionForm open={!!editing} onOpenChange={(o) => !o && setEditing(null)} initial={editing} onSave={save} page={`${page}_revtopics`} module={scope} />
    </section>
  );
}
