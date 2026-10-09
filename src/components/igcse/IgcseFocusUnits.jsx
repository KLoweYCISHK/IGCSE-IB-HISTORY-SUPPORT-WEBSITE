import React, { useCallback, useEffect, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import IgcseFocusUnitForm from './IgcseFocusUnitForm';

export default function IgcseFocusUnits({ page, title = 'Focus units', description }) {
  const { editMode } = useAdmin();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const list = await store.entities.IgcseFocusUnit.filter({ page }, 'order');
      setUnits(list);
    } catch (e) {
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
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

  return (
    <section className="py-16 md:py-20 border-t border-border">
      <SectionHeading
        eyebrow="Case studies"
        title={title}
        description={description}
        right={editMode ? (
          <Button variant="outline" size="sm" onClick={() => setEditing({})}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add focus unit
          </Button>
        ) : null}
      />

      {loading ? (
        <div className="h-24 animate-pulse bg-black/[0.04] rounded" />
      ) : units.length === 0 ? (
        editMode ? (
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60">Add your first focus unit — it will also appear as a topic in the Paper 1 question bank.</p>
        ) : null
      ) : (
        <div className="border border-border rounded-sm overflow-hidden bg-card">
          <div className="grid grid-cols-3 bg-[#E8E0CE]">
            <div className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/80 border-b border-border">Focus unit</div>
            <div className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/80 border-b border-border border-l">Focus points</div>
            <div className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/80 border-b border-border border-l">Specified content</div>
          </div>
          {units.map((u, i) => (
            <div key={u.id} className="group relative grid grid-cols-3 border-b border-border last:border-b-0">
              {editMode && (
                <div className="absolute top-1/2 -translate-y-1/2 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-card border border-border rounded px-1 py-1">
                  <button onClick={() => move(i, -1)} className="p-1.5 hover:text-[#6F551A]"><ArrowUp className="w-4 h-4" /></button>
                  <button onClick={() => move(i, 1)} className="p-1.5 hover:text-[#6F551A]"><ArrowDown className="w-4 h-4" /></button>
                  <button onClick={() => setEditing(u)} className="p-1.5 hover:text-[#6F551A]"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(u.id)} className="p-1.5 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
              <div className="px-4 py-5 pr-24">
                <p className="font-display text-lg leading-snug">{u.focus_unit}</p>
              </div>
              <div className="px-4 py-5 border-l border-border">
                {u.bullet_points?.length > 0 ? (
                  <ul className="space-y-1.5 list-disc pl-5 text-[15px] text-foreground/80">
                    {u.bullet_points.map((b, bi) => <li key={bi}>{b}</li>)}
                  </ul>
                ) : null}
              </div>
              <div className="px-4 py-5 border-l border-border">
                {u.specified_content?.length > 0 ? (
                  <ul className="space-y-1.5 list-disc pl-5 text-[15px] text-foreground/80">
                    {u.specified_content.map((c, ci) => <li key={ci}>{c}</li>)}
                  </ul>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <IgcseFocusUnitForm open={!!editing} onOpenChange={(o) => !o && setEditing(null)} initial={editing} onSave={save} />
    </section>
  );
}