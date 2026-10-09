import React, { useCallback, useEffect, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import IgcsePaper2FocusForm from './IgcsePaper2FocusForm';

const PAGE_LABELS = { igcse_core1: 'Core 1', igcse_core2: 'Core 2' };

export default function IgcsePaper2Focus({ title = 'Topic focus by year', description }) {
  const { editMode } = useAdmin();
  const [focuses, setFocuses] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fList, uList] = await Promise.all([
        store.entities.IgcsePaper2Focus.list(),
        store.entities.IgcseFocusUnit.list('order'),
      ]);
      // Most recent year first
      setFocuses([...fList].sort((a, b) => (b.year || 0) - (a.year || 0)));
      setUnits(uList.filter((u) => u.page === 'igcse_core1' || u.page === 'igcse_core2'));
    } catch (e) {
      setFocuses([]);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const h = () => load();
    window.addEventListener('archive:reload', h);
    return () => window.removeEventListener('archive:reload', h);
  }, [load]);

  const unitById = useCallback((id) => units.find((u) => u.id === id), [units]);

  const save = async (draft) => {
    const { id, ...data } = draft;
    if (id) await editDb.IgcsePaper2Focus.update(id, data);
    else await editDb.IgcsePaper2Focus.create(data);
    setEditing(null);
    load();
    window.dispatchEvent(new Event('archive:reload'));
  };
  const remove = async (id) => {
    await editDb.IgcsePaper2Focus.delete(id);
    load();
    window.dispatchEvent(new Event('archive:reload'));
  };

  return (
    <section className="py-16 md:py-20 border-t border-border">
      <SectionHeading
        eyebrow="Examination"
        title={title}
        description={description || 'The topic focus changes each year — the most recent year is shown at the top.'}
        right={editMode ? (
          <Button variant="outline" size="sm" onClick={() => setEditing({})}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add year
          </Button>
        ) : null}
      />

      {loading ? (
        <div className="h-24 animate-pulse bg-black/[0.04] rounded" />
      ) : focuses.length === 0 ? (
        editMode ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60">Add the focus unit for the first exam year.</p>
        ) : (
          <p className="text-foreground/40 italic">No focus years added yet.</p>
        )
      ) : (
        <div className="space-y-4">
          {focuses.map((f) => {
            const u = unitById(f.focus_unit_id);
            return (
              <div key={f.id} className="group relative border border-border rounded-sm p-6 bg-card">
                <div className="flex items-baseline gap-4 mb-4 flex-wrap">
                  <span className="font-display text-3xl leading-none text-[#6F551A]">{f.year}</span>
                  {u && (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded px-2 py-1">{PAGE_LABELS[u.page] || u.page}</span>
                  )}
                </div>
                {u ? (
                  <h4 className="font-display text-xl leading-snug">{u.focus_unit}</h4>
                ) : (
                  <p className="text-foreground/40 italic text-sm">Focus unit not found.</p>
                )}
                {editMode && (
                  <div className="mt-4 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditing(f)}><Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => remove(f.id)}><Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete</Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <IgcsePaper2FocusForm
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        initial={editing}
        focusUnits={units}
        onSave={save}
      />
    </section>
  );
}