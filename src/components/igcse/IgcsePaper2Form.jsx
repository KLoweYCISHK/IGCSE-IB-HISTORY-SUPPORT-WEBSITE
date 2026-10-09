import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function IgcsePaper2Form({ open, onOpenChange, initial, onSave }) {
  const [draft, setDraft] = useState(initial || {});
  useEffect(() => { if (open) setDraft(initial || {}); }, [open, initial]);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">{initial?.id ? 'Edit' : 'New'} Paper 2 entry</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="chrono-eyebrow">Topic</Label>
            <Input value={draft.topic || ''} onChange={(e) => set('topic', e.target.value)} placeholder="e.g. Treaty of Versailles" />
          </div>
          <div className="space-y-2">
            <Label className="chrono-eyebrow">Title</Label>
            <Input value={draft.title || ''} onChange={(e) => set('title', e.target.value)} placeholder="Specific paper title" />
          </div>
          <div className="space-y-2">
            <Label className="chrono-eyebrow">Link to paper</Label>
            <Input value={draft.paper_url || ''} onChange={(e) => set('paper_url', e.target.value)} placeholder="https://…" />
          </div>
          <div className="space-y-2">
            <Label className="chrono-eyebrow">Link to mark scheme</Label>
            <Input value={draft.mark_scheme_url || ''} onChange={(e) => set('mark_scheme_url', e.target.value)} placeholder="https://…" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!draft.title} onClick={() => onSave(draft)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}