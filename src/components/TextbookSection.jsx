import React, { useCallback, useEffect, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { Button } from '@/components/ui/button';
import { Image } from '@/components/ui/image';
import { ExternalLink, Pencil, Trash2, Plus } from 'lucide-react';
import SectionHeading from './SectionHeading';
import TextbookForm from './TextbookForm';

export default function TextbookSection({
  section,
  caseStudy,
  module,
  title = 'Textbooks',
  description = 'Core textbooks and course readings for this paper.',
}) {
  const { editMode } = useAdmin();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    const query = { section };
    if (caseStudy) query.case_study = caseStudy;
    const list = await store.entities.Textbook.filter(query, 'order');
    setItems(module ? list.filter((t) => t.module === module) : list);
  }, [section, caseStudy, module]);

  useEffect(() => { load(); }, [load]);

  const save = async (draft) => {
    const { id, ...data } = draft;
    if (id) await editDb.Textbook.update(id, data);
    else {
      const payload = { ...data, section, case_study: caseStudy || 'all' };
      if (module) payload.module = data.module || module;
      await editDb.Textbook.create(payload);
    }
    setEditing(null);
    load();
  };

  const remove = async (t) => {
    await editDb.Textbook.delete(t.id);
    load();
  };

  return (
    <section className="py-16 md:py-24 border-t border-border">
      <SectionHeading
        eyebrow="Required reading"
        title={title}
        description={description}
        right={
          editMode ? (
            <Button onClick={() => setEditing({})} className="bg-[#6F551A] hover:bg-[#5A4514] text-[#F4EFE3]">
              <Plus className="w-4 h-4 mr-1.5" /> Add a textbook
            </Button>
          ) : null
        }
      />

      {items.length === 0 ? (
        <p className="text-foreground/40 italic">No textbooks yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((t) => (
            <div key={t.id} className="glassine group relative border border-border rounded-sm overflow-hidden bg-card flex flex-col">
              <div className="aspect-[3/4] overflow-hidden bg-secondary">
                {t.image_url ? (
                  <Image src={t.image_url} alt={t.title} className="w-full h-full" fittingType="fill" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-foreground/30 font-mono text-xs uppercase tracking-wider">No cover</div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <h4 className="font-display text-lg leading-snug">{t.title}</h4>
                {t.description && <p className="mt-1.5 text-sm text-foreground/60 leading-relaxed">{t.description}</p>}
                <div className="mt-auto pt-3">
                  {t.url && (
                    <a href={t.url} target="_blank" rel="noreferrer" className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#6F551A] inline-flex items-center gap-1.5">
                      Open <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
              {editMode && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition bg-card/90 border border-border rounded">
                  <button onClick={() => setEditing(t)} className="p-1.5 hover:text-[#6F551A]"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(t)} className="p-1.5 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <TextbookForm open={!!editing} onOpenChange={(o) => !o && setEditing(null)} initial={editing} onSave={save} module={module} />
    </section>
  );
}