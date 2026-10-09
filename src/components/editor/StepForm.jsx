import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function StepForm({ open, onOpenChange, initial, onSave }) {
  const [draft, setDraft] = useState(initial || {});

  useEffect(() => { if (open) setDraft(initial || {}); }, [open, initial]);

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">{initial?.id ? 'Edit step' : 'New step'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <p className="chrono-eyebrow">Step title</p>
            <Input value={draft.title || ''} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Choosing a topic for your History EE" />
          </div>
          <div className="space-y-2">
            <p className="chrono-eyebrow">Subtitle (optional)</p>
            <Input value={draft.subtitle || ''} onChange={(e) => set('subtitle', e.target.value)} placeholder="e.g. Topic, research question, supervisor meetings and reading." />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!draft.title?.trim()} onClick={() => onSave(draft)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}