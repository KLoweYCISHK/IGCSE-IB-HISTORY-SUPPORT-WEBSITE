import React, { useCallback, useEffect, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown, RotateCw } from 'lucide-react';
import SectionHeading from './SectionHeading';
import BlockCanvas from './BlockCanvas';
import SectionForm from './editor/SectionForm';

export default function SectionCanvas({ page, caseStudy, module, className = '', filterFn }) {
  const { editMode } = useAdmin();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await store.entities.PageSection.filter({ page }, 'order');
      const visible = (module
        ? list.filter((s) => !s.is_deleted && s.module === module)
        : list.filter((s) => !s.is_deleted)
      ).filter((s) => (filterFn ? filterFn(s) : true));
      setSections(visible);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [page, module]);

  useEffect(() => {
    setLoading(true); load();
    const handler = () => load();
    window.addEventListener('archive:reload', handler);
    return () => window.removeEventListener('archive:reload', handler);
  }, [load]);

  const save = async (draft) => {
    const { id, ...data } = draft;
    if (id) await editDb.PageSection.update(id, data);
    else await editDb.PageSection.create({ ...data, page, module: data.module || module || 'all', order: sections.length });
    setEditing(null);
    load();
  };

  const move = async (index, dir) => {
    const target = sections[index + dir];
    if (!target) return;
    const current = sections[index];
    await editDb.PageSection.bulkUpdate([
      { id: current.id, order: index + dir },
      { id: target.id, order: index },
    ]);
    load();
  };

  const remove = async (s) => {
    await editDb.ContentBlock.updateMany({ section: page, sub: s.slug }, { $set: { is_deleted: true } });
    await editDb.PageSection.update(s.id, { is_deleted: true });
    load();
  };

  if (loading) return <div className="h-24 animate-pulse bg-black/[0.04] rounded" />;

  if (error) {
    return (
      <div className="py-12 border-t border-border text-center">
        <p className="text-foreground/60 mb-4">Couldn't load this section — please check your connection.</p>
        <Button variant="outline" size="sm" onClick={load}>
          <RotateCw className="w-3.5 h-3.5 mr-1.5" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={className}>
      {sections.map((s, i) => (
        <section key={s.id} className="relative group py-16 md:py-20 border-t border-border">
          {editMode && (
            <div className="absolute -top-3 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-card border border-border rounded px-1 py-1">
              <button onClick={() => move(i, -1)} className="p-1.5 hover:text-[#6F551A]"><ArrowUp className="w-4 h-4" /></button>
              <button onClick={() => move(i, 1)} className="p-1.5 hover:text-[#6F551A]"><ArrowDown className="w-4 h-4" /></button>
              <button onClick={() => setEditing(s)} className="p-1.5 hover:text-[#6F551A]"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => remove(s)} className="p-1.5 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
          <SectionHeading eyebrow={s.eyebrow} title={s.title} />
          <BlockCanvas section={page} sub={s.slug} caseStudy={caseStudy} module={module} emptyLabel="No content here yet." />
        </section>
      ))}

      {editMode && (
        <div className="py-10 border-t border-dashed border-border">
          <Button variant="outline" size="sm" onClick={() => setEditing({})}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add section
          </Button>
        </div>
      )}

      <SectionForm open={!!editing} onOpenChange={(o) => !o && setEditing(null)} initial={editing} onSave={save} page={page} module={module} />
    </div>
  );
}