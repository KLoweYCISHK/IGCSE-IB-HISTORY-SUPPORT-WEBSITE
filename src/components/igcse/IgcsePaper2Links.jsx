import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, FileText, ClipboardCheck, ExternalLink } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import IgcsePaper2Form from './IgcsePaper2Form';

function LinkBtn({ href, icon: Icon, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/10 hover:border-accent/40"
    >
      <Icon className="w-4 h-4 text-muted-foreground" />
      {label}
      <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
    </a>
  );
}

export default function IgcsePaper2Links({ section = 'igcse_paper2', title = 'Paper 2', description }) {
  const { editMode } = useAdmin();
  const [items, setItems] = useState([]);
  const [topic, setTopic] = useState('all');
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setItems(await store.entities.IgcsePaper2Link.filter({ section }, 'order'));
  }, [section]);

  useEffect(() => {
    load();
    const h = () => load();
    window.addEventListener('archive:reload', h);
    return () => window.removeEventListener('archive:reload', h);
  }, [load]);

  const topics = useMemo(() => Array.from(new Set(items.map((i) => i.topic).filter(Boolean))).sort(), [items]);
  const filtered = topic === 'all' ? items : items.filter((i) => i.topic === topic);

  const save = async (draft) => {
    const { id, ...data } = draft;
    if (id) await editDb.IgcsePaper2Link.update(id, data);
    else await editDb.IgcsePaper2Link.create({ ...data, section, order: items.length });
    setEditing(null);
    load();
  };
  const del = async (id) => { await editDb.IgcsePaper2Link.delete(id); load(); };

  return (
    <section className="py-16 md:py-24 border-t border-border">
      <SectionHeading
        eyebrow="Examination"
        title={title}
        description={description || 'The source-based paper — pick a topic, then open the paper and its mark scheme.'}
        right={editMode ? (
          <Button variant="outline" size="sm" onClick={() => setEditing({})}>
            <Plus className="w-4 h-4 mr-1.5" /> Add entry
          </Button>
        ) : null}
      />

      {topics.length > 0 && (
        <div className="inline-flex flex-wrap border border-border rounded-sm overflow-hidden mb-8">
          <button
            onClick={() => setTopic('all')}
            className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] ${topic === 'all' ? 'bg-foreground text-background' : 'hover:bg-black/[0.04]'}`}
          >
            All topics
          </button>
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`px-4 py-2 font-mono text-[10px] uppercase tracking-[0.18em] border-l border-border ${topic === t ? 'bg-foreground text-background' : 'hover:bg-black/[0.04]'}`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <p className="text-foreground/40 italic">No entries added yet.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((e, i) => (
            <div key={e.id} className="border border-border rounded-sm p-6 bg-card">
              <div className="flex items-baseline gap-4 mb-3 flex-wrap">
                <span className="font-mono text-xs text-[#6F551A]">{String(i + 1).padStart(2, '0')}</span>
                <h4 className="font-display text-xl leading-snug">{e.title}</h4>
                {e.topic && (
                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground border border-border rounded px-2 py-1">{e.topic}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                {e.paper_url && <LinkBtn href={e.paper_url} icon={FileText} label="Paper" />}
                {e.mark_scheme_url && <LinkBtn href={e.mark_scheme_url} icon={ClipboardCheck} label="Mark scheme" />}
              </div>
              {editMode && (
                <div className="mt-4 flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditing(e)}><Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit</Button>
                  <Button size="sm" variant="ghost" onClick={() => del(e.id)}><Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete</Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <IgcsePaper2Form open={!!editing} onOpenChange={(o) => !o && setEditing(null)} initial={editing} onSave={save} />
    </section>
  );
}