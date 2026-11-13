import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { useProgress } from '@/lib/progress';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, ChevronDown, Check } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import SectionCanvas from '@/components/SectionCanvas';
import RevisedTick from '@/components/RevisedTick';
import ProgressTransfer from '@/components/ProgressTransfer';
import IgcseFocusUnitForm from './IgcseFocusUnitForm';

// Each focus unit opens to show its syllabus points and its own revision notes. Used by IGCSE and IB pages.
// Revision notes are ordinary sections, stored on the page "<page>_revision" with module = the focus unit's id.
// noteScope (IB Paper 2): the same focus units are shared by several case studies, each with its own notes;
// notes are then stored with module = "<unit id>__<case study>". showNotes=false lists the units without notes.
export default function IgcseFocusUnits({
  page, title = 'Focus units', description, eyebrow = 'Focus units & revision',
  noteScope = '', showNotes = true, notesHint,
  pointsLabel = 'Focus points', contentLabel = 'Specified content', pointNoun = 'focus point', pointNounPlural = 'focus points',
  formLabels,
}) {
  const { editMode } = useAdmin();
  const { revised } = useProgress();
  const revisionPage = `${page}_revision`;
  const noteKey = (u) => (noteScope ? `${u.id}__${noteScope}` : u.id);
  const [units, setUnits] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [open, setOpen] = useState({});

  const loadNotes = useCallback(async () => {
    try {
      const list = await store.entities.PageSection.filter({ page: revisionPage });
      setNotes(list.filter((s) => !s.is_deleted));
    } catch { setNotes([]); }
  }, [revisionPage]);

  const load = useCallback(async () => {
    try {
      setUnits(await store.entities.IgcseFocusUnit.filter({ page }, 'order'));
    } catch {
      setUnits([]);
    } finally {
      setLoading(false);
    }
    loadNotes();
  }, [page, loadNotes]);

  useEffect(() => {
    setLoading(true); setOpen({}); load();
    const h = () => load();
    window.addEventListener('archive:reload', h);
    return () => window.removeEventListener('archive:reload', h);
  }, [load]);

  const save = async (draft) => {
    const { id, ...data } = draft;
    const cleanBullets = (Array.isArray(data.bullet_points) ? data.bullet_points : []).map((s) => s.trim()).filter(Boolean);
    const cleanContent = (Array.isArray(data.specified_content) ? data.specified_content : []).map((s) => s.trim()).filter(Boolean);
    const payload = { ...data, bullet_points: cleanBullets, specified_content: cleanContent, page };
    if (id) await editDb.IgcseFocusUnit.update(id, payload);
    else await editDb.IgcseFocusUnit.create({ ...payload, order: units.length });
    setEditing(null);
    load();
    window.dispatchEvent(new Event('archive:reload'));
  };

  const move = async (index, dir) => {
    const target = units[index + dir];
    if (!target) return;
    const current = units[index];
    await editDb.IgcseFocusUnit.bulkUpdate([
      { id: current.id, order: index + dir },
      { id: target.id, order: index },
    ]);
    load();
  };

  const remove = async (id) => {
    await editDb.IgcseFocusUnit.delete(id);
    load();
    window.dispatchEvent(new Event('archive:reload'));
  };

  const counts = useMemo(() => Object.fromEntries(units.map((u) => {
    const mine = notes.filter((n) => n.module === noteKey(u));
    return [u.id, { total: mine.length, done: mine.filter((n) => revised[n.id]).length }];
  })), [units, notes, revised, noteScope]); // eslint-disable-line react-hooks/exhaustive-deps
  const total = units.reduce((n, u) => n + counts[u.id].total, 0);
  const done = units.reduce((n, u) => n + counts[u.id].done, 0);

  // students see nothing until there is at least one focus unit
  if (!editMode && !loading && units.length === 0) return null;

  return (
    <section id="focus-units" className="py-12 md:py-16 border-t border-border scroll-mt-28">
      <SectionHeading
        eyebrow={eyebrow}
        title={title}
        description={description}
        right={editMode ? (
          <Button variant="outline" size="sm" onClick={() => setEditing({})}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add focus unit
          </Button>
        ) : null}
      />

      {showNotes && total > 0 && (
        <div className="mb-6 rounded-sm bg-card border border-border p-5 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-semibold">{done} of {total} revision topics revised</p>
            <ProgressTransfer />
          </div>
          <div className="h-2.5 rounded-full bg-border overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-label="Revision topics revised">
            <div className="h-full bg-[#1D4ED8] transition-all" style={{ width: `${(done / total) * 100}%` }} />
          </div>
          <p className="text-sm text-muted-foreground">Your ticks are saved on this device. No login needed.</p>
        </div>
      )}

      {editMode && showNotes && units.length > 0 && (
        <div className="mb-6 rounded-sm border border-dashed border-[#1D4ED8] bg-[#1D4ED8]/5 p-5 text-sm space-y-1">
          <p className="font-bold">Adding revision notes (only you see this)</p>
          <p>Open a focus unit and use "Add revision subsection". Give each subsection a title, then add text, images, files or links inside it as usual.</p>
          <p>Students get a "Mark as revised" tick on every subsection. Any two-column table (term and meaning, date and event) also gets a "Test yourself with flashcards" button.</p>
          <p>Key words: select a word in your saved notes and click "Make key word" to give it a meaning and Simplified Chinese. It is then highlighted everywhere it appears, and students click it to see the pop-up.</p>
        </div>
      )}

      {loading ? (
        <div className="h-24 animate-pulse bg-black/[0.04] rounded" />
      ) : units.length === 0 ? (
        editMode ? (
          <p className="text-sm font-semibold text-muted-foreground">Add your first focus unit, then open it to add its revision notes.</p>
        ) : null
      ) : (
        <div className="space-y-4">
          {units.map((u, i) => {
            const isOpen = !!open[u.id];
            const c = counts[u.id];
            const allDone = c.total > 0 && c.done === c.total;
            return (
              <div key={u.id} className={`rounded-sm border bg-card ${isOpen ? 'border-[#1D4ED8]' : 'border-border'}`}>
                <div className="flex items-stretch">
                  <button
                    onClick={() => setOpen((o) => ({ ...o, [u.id]: !o[u.id] }))}
                    aria-expanded={isOpen}
                    aria-controls={`focus-unit-${u.id}`}
                    className="flex-1 min-w-0 flex items-center gap-4 p-5 md:p-6 text-left"
                  >
                    <span className={`shrink-0 w-11 h-11 rounded-full flex items-center justify-center font-display text-lg ${allDone ? 'bg-teal-700 text-white' : 'bg-[#1D4ED8] text-white'}`}>
                      {allDone ? <Check className="w-5 h-5" aria-label="All revised" /> : i + 1}
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-display text-xl md:text-2xl leading-snug">{u.focus_unit}</span>
                      <span className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-foreground/70">
                        {u.bullet_points?.length > 0 && <span>{u.bullet_points.length} {u.bullet_points.length === 1 ? pointNoun : pointNounPlural}</span>}
                        {showNotes && (
                          <span className="font-semibold text-[#1E40AF]">
                            {c.total === 0 ? 'Revision notes coming soon' : `${c.done} of ${c.total} revision topic${c.total === 1 ? '' : 's'} revised`}
                          </span>
                        )}
                      </span>
                    </span>
                    <ChevronDown className={`shrink-0 w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {editMode && (
                    <div className="flex items-center gap-1 pr-3">
                      <button onClick={() => move(i, -1)} aria-label="Move focus unit up" className="p-1.5 hover:text-[#1D4ED8]"><ArrowUp className="w-4 h-4" /></button>
                      <button onClick={() => move(i, 1)} aria-label="Move focus unit down" className="p-1.5 hover:text-[#1D4ED8]"><ArrowDown className="w-4 h-4" /></button>
                      <button onClick={() => setEditing(u)} aria-label="Edit focus unit" className="p-1.5 hover:text-[#1D4ED8]"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => remove(u.id)} aria-label="Delete focus unit" className="p-1.5 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>

                {isOpen && (
                  <div id={`focus-unit-${u.id}`} className="border-t border-border p-5 md:p-6 space-y-8">
                    {(u.bullet_points?.length > 0 || u.specified_content?.length > 0) && (
                      <div className="grid md:grid-cols-2 gap-4">
                        {u.bullet_points?.length > 0 && (
                          <div className="rounded-sm bg-background border border-border p-5">
                            <p className="chrono-eyebrow mb-3">{pointsLabel}</p>
                            <ul className="space-y-1.5 list-disc pl-5 text-[15px] text-foreground/85">
                              {u.bullet_points.map((b, bi) => <li key={bi}>{b}</li>)}
                            </ul>
                          </div>
                        )}
                        {u.specified_content?.length > 0 && (
                          <div className="rounded-sm bg-background border border-border p-5">
                            <p className="chrono-eyebrow mb-3">{contentLabel}</p>
                            <ul className="space-y-1.5 list-disc pl-5 text-[15px] text-foreground/85">
                              {u.specified_content.map((cnt, ci) => <li key={ci}>{cnt}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}

                    {!showNotes ? (notesHint && <p className="font-semibold text-[#1E40AF]">{notesHint}</p>) : (
                    <div>
                      <h3 className="font-display text-2xl mb-4">Revision notes</h3>
                      <SectionCanvas
                        key={noteKey(u)}
                        page={revisionPage}
                        module={noteKey(u)}
                        compact
                        collapsible
                        scopeSlugs
                        tableFlashcards
                        keyTerms
                        addLabel="Add revision subsection"
                        onChange={loadNotes}
                        sectionAction={(s) => <RevisedTick id={s.id} small />}
                        empty={!editMode && <p className="text-foreground/60">Revision notes for this unit are on their way.</p>}
                      />
                    </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <IgcseFocusUnitForm open={!!editing} onOpenChange={(o) => !o && setEditing(null)} initial={editing} onSave={save} labels={formLabels} />
    </section>
  );
}
