import React, { useCallback, useEffect, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RotateCcw, Trash2 } from 'lucide-react';

const blockLabel = (b) =>
  b.title?.trim() ||
  (b.kind === 'table' ? 'Table' : b.kind === 'image' ? 'Image' : 'Text block');

export default function TrashDialog({ open, onOpenChange, onChanged }) {
  const [sections, setSections] = useState([]);
  const [blocks, setBlocks] = useState([]);

  const load = useCallback(async () => {
    const [secs, blks] = await Promise.all([
      store.entities.PageSection.filter({ is_deleted: true }, 'order'),
      store.entities.ContentBlock.filter({ is_deleted: true }, '-updated_date'),
    ]);
    setSections(secs);
    setBlocks(blks);
  }, []);

  useEffect(() => { if (open) load(); }, [open, load]);

  const notify = () => onChanged?.();

  const restoreSection = async (s) => {
    await editDb.ContentBlock.updateMany(
      { section: s.page, sub: s.slug },
      { $set: { is_deleted: false } }
    );
    await editDb.PageSection.update(s.id, { is_deleted: false });
    await load(); notify();
  };

  const restoreBlock = async (b) => {
    await editDb.ContentBlock.update(b.id, { is_deleted: false });
    await load(); notify();
  };

  const purgeSection = async (s) => {
    await editDb.ContentBlock.deleteMany({ section: s.page, sub: s.slug });
    await editDb.PageSection.delete(s.id);
    await load(); notify();
  };

  const purgeBlock = async (b) => {
    await editDb.ContentBlock.delete(b.id);
    await load(); notify();
  };

  const empty = sections.length === 0 && blocks.length === 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">Trash</DialogTitle>
          <DialogDescription>Restore deleted sections and blocks, or remove them permanently.</DialogDescription>
        </DialogHeader>

        {empty ? (
          <p className="text-foreground/50 italic py-8">Nothing has been deleted.</p>
        ) : (
          <div className="space-y-6 py-2">
            {sections.length > 0 && (
              <div>
                <p className="chrono-eyebrow mb-3">Sections</p>
                <ul className="space-y-2">
                  {sections.map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-3 border border-border rounded-sm px-4 py-3">
                      <div className="min-w-0">
                        <p className="font-display text-lg leading-tight">{s.title}</p>
                        <p className="chrono-eyebrow">{s.page} · {s.slug}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => restoreSection(s)}><RotateCcw className="w-3.5 h-3.5 mr-1" />Restore</Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => purgeSection(s)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {blocks.length > 0 && (
              <div>
                <p className="chrono-eyebrow mb-3">Blocks</p>
                <ul className="space-y-2">
                  {blocks.map((b) => (
                    <li key={b.id} className="flex items-center justify-between gap-3 border border-border rounded-sm px-4 py-3">
                      <div className="min-w-0">
                        <p className="font-display text-lg leading-tight truncate">{blockLabel(b)}</p>
                        <p className="chrono-eyebrow">{b.section} · {b.sub}{b.case_study && b.case_study !== 'all' ? ` · ${b.case_study}` : ''}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => restoreBlock(b)}><RotateCcw className="w-3.5 h-3.5 mr-1" />Restore</Button>
                        <Button size="sm" variant="ghost" className="text-destructive" onClick={() => purgeBlock(b)}><Trash2 className="w-3.5 h-3.5" /></Button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}