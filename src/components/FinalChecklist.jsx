import React, { useCallback, useEffect, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { Button } from '@/components/ui/button';
import { Plus, Pencil, Trash2, ArrowUp, ArrowDown, FileDown } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { generateChecklistDoc } from '@/lib/checklistDoc';

export default function FinalChecklist({ page, title = 'Final checklist' }) {
  const { editMode } = useAdmin();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState({});
  const [editing, setEditing] = useState(null);
  const [draft, setDraft] = useState('');

  const load = useCallback(async () => {
    const list = await store.entities.ChecklistItem.filter({ page }, 'order');
    setItems(list.filter((i) => !i.is_deleted));
    setLoading(false);
  }, [page]);

  useEffect(() => {
    setLoading(true); load();
    const h = () => load();
    window.addEventListener('archive:reload', h);
    return () => window.removeEventListener('archive:reload', h);
  }, [load]);

  const toggle = (id) => setChecked((c) => ({ ...c, [id]: !c[id] }));

  const save = async () => {
    const text = draft.trim();
    if (!text) return;
    if (editing?.id) {
      await editDb.ChecklistItem.update(editing.id, { text });
    } else {
      await editDb.ChecklistItem.create({ page, text, order: items.length });
    }
    setEditing(null); setDraft('');
    load();
  };

  const move = async (index, dir) => {
    const target = items[index + dir];
    if (!target) return;
    const current = items[index];
    await editDb.ChecklistItem.bulkUpdate([
      { id: current.id, order: index + dir },
      { id: target.id, order: index },
    ]);
    load();
  };

  const remove = async (id) => { await editDb.ChecklistItem.delete(id); load(); };

  const download = async () => { await generateChecklistDoc(title, items); };

  if (loading) return <div className="h-24 animate-pulse bg-black/[0.04] rounded" />;

  return (
    <div className="py-8">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <p className="text-foreground/60 max-w-xl">Tick each item off before you submit. Download a copy to keep track in Microsoft Word.</p>
        <Button variant="outline" size="sm" onClick={download}>
          <FileDown className="w-4 h-4 mr-1.5" /> Download to Word
        </Button>
      </div>

      <ul className="space-y-3">
        {items.map((it, i) => (
          <li key={it.id} className="group relative flex items-start gap-3 border border-border rounded-sm bg-card px-4 py-3">
            {editMode && (
              <div className="absolute -top-3 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-card border border-border rounded px-1 py-1">
                <button onClick={() => move(i, -1)} className="p-1.5 hover:text-[#6F551A]"><ArrowUp className="w-4 h-4" /></button>
                <button onClick={() => move(i, 1)} className="p-1.5 hover:text-[#6F551A]"><ArrowDown className="w-4 h-4" /></button>
                <button onClick={() => { setEditing(it); setDraft(it.text); }} className="p-1.5 hover:text-[#6F551A]"><Pencil className="w-4 h-4" /></button>
                <button onClick={() => remove(it.id)} className="p-1.5 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
              </div>
            )}
            <button
              onClick={() => toggle(it.id)}
              className="mt-1 w-5 h-5 shrink-0 border-2 border-foreground/40 rounded-sm flex items-center justify-center hover:border-[#6F551A] transition-colors"
              aria-label="Toggle item"
            >
              {checked[it.id] && <span className="w-2.5 h-2.5 bg-[#6F551A] rounded-[2px]" />}
            </button>
            <div
              className={`flex-1 prose-archive ${checked[it.id] ? 'line-through text-foreground/40' : ''}`}
              dangerouslySetInnerHTML={{ __html: String(it.text).replace(/&nbsp;|\u00A0/g, ' ') }}
            />
          </li>
        ))}
      </ul>

      {items.length === 0 && !editMode && (
        <p className="py-10 text-foreground/40 italic">Checklist items coming soon.</p>
      )}

      {editMode && (
        <Button variant="outline" size="sm" onClick={() => { setEditing({}); setDraft(''); }} className="mt-6">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add checklist item
        </Button>
      )}

      <Dialog open={!!editing} onOpenChange={(o) => { if (!o) { setEditing(null); setDraft(''); } }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit checklist item' : 'Add checklist item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 py-2">
            <Label htmlFor="ck-text">Item text</Label>
            <Textarea id="ck-text" value={draft} onChange={(e) => setDraft(e.target.value)} rows={4} placeholder="e.g. Word count is within 2,200 words" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setEditing(null); setDraft(''); }}>Cancel</Button>
            <Button onClick={save} disabled={!draft.trim()}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}