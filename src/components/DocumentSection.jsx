import React, { useCallback, useEffect, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { Button } from '@/components/ui/button';
import { FileText, Download, Pencil, Trash2, Plus, Eye, EyeOff } from 'lucide-react';
import SectionHeading from './SectionHeading';
import DocumentForm from './DocumentForm';

export default function DocumentSection({
  section,
  title = 'Documents',
  description = 'Downloadable handouts and templates.',
  embedded = false,
}) {
  const { editMode } = useAdmin();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    const list = await store.entities.Document.filter({ section }, 'order');
    setItems(list);
  }, [section]);

  useEffect(() => { load(); }, [load]);

  const save = async (draft) => {
    const { id, ...data } = draft;
    if (id) await editDb.Document.update(id, data);
    else await editDb.Document.create({ ...data, section });
    setEditing(null);
    load();
  };

  const remove = async (d) => {
    await editDb.Document.delete(d.id);
    load();
  };

  const Wrapper = embedded ? 'div' : 'section';
  const wrapperClass = embedded ? '' : 'py-16 md:py-24 border-t border-border';

  return (
    <Wrapper className={wrapperClass}>
      <SectionHeading
        eyebrow="Downloads"
        title={title}
        description={description}
        right={
          editMode ? (
            <Button onClick={() => setEditing({})} className="bg-[#6F551A] hover:bg-[#5A4514] text-[#F4EFE3]">
              <Plus className="w-4 h-4 mr-1.5" /> Add a document
            </Button>
          ) : null
        }
      />

      {items.length === 0 ? (
        <p className="text-foreground/40 italic">No documents yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 gap-5">
          {items.map((d) => (
            <div key={d.id} className="glassine group relative border border-border rounded-sm bg-card p-5 flex items-start gap-4">
              <div className="shrink-0 w-12 h-12 rounded-sm bg-secondary flex items-center justify-center text-[#6F551A]">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-display text-xl leading-snug">{d.title}</h4>
                {d.description && <p className="mt-1 text-sm text-foreground/60 leading-relaxed">{d.description}</p>}
                {section === 'ia' && (d.mark_1 != null || d.mark_2 != null || d.mark_3 != null) && (
                  <IaMarks doc={d} />
                )}
                {d.file_name && <p className="mt-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground truncate">{d.file_name}</p>}
                {d.file_url && (
                  <a
                    href={d.file_url}
                    download={d.file_name || undefined}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#6F551A] hover:text-[#5A4514]"
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                )}
              </div>
              {editMode && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition bg-card/90 border border-border rounded">
                  <button onClick={() => setEditing(d)} className="p-1.5 hover:text-[#6F551A]"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => remove(d)} className="p-1.5 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <DocumentForm open={!!editing} onOpenChange={(o) => !o && setEditing(null)} initial={editing} onSave={save} section={section} />
    </Wrapper>
  );
}

function IaMarks({ doc }) {
  const [open, setOpen] = useState(false);
  const rows = [
    { label: 'Historical Inquiry Question', max: 6, mark: doc.mark_1, reason: doc.reason_1 },
    { label: 'Sources & perspective', max: 6, mark: doc.mark_2, reason: doc.reason_2 },
    { label: 'Synthesis & evaluation', max: 12, mark: doc.mark_3, reason: doc.reason_3 },
  ];
  return (
    <div className="mt-3 border-t border-border pt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-[#6F551A] hover:text-[#5A4514]"
      >
        {open ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
        {open ? 'Hide marks' : 'View marks'}
      </button>
      {open && (
        <div className="mt-2 space-y-2">
          {rows.map((s) => (
            <div key={s.label} className="text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-foreground/70">{s.label}</span>
                <span className="font-mono text-xs text-[#6F551A]">{s.mark != null ? `${s.mark} / ${s.max}` : `— / ${s.max}`}</span>
              </div>
              {s.reason && <p className="text-foreground/55 leading-relaxed">{s.reason}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}