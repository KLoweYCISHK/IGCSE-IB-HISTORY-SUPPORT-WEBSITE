import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UNITS } from '@/lib/perspectiveTopics';
import ImageUploadField from './editor/ImageUploadField';

const MODULE_OPTIONS = [
  { value: 'russian_revolution', label: UNITS.russian_revolution.label },
  { value: 'cold_war', label: UNITS.cold_war.label },
  { value: 'all', label: 'Both modules' },
];

export default function TextbookForm({ open, onOpenChange, initial, onSave, module }) {
  const [draft, setDraft] = useState(initial || {});
  useEffect(() => {
    if (open) setDraft({ ...(initial || {}), module: module ? (initial?.module || module) : initial?.module });
  }, [open, initial, module]);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">{initial?.id ? 'Edit textbook' : 'Add a textbook'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Input value={draft.title || ''} onChange={(e) => set('title', e.target.value)} placeholder="Title" />
          <Input value={draft.url || ''} onChange={(e) => set('url', e.target.value)} placeholder="https://…" />
          <Textarea value={draft.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Short note (optional)" rows={2} />
          {module && (
            <div className="space-y-1.5">
              <p className="chrono-eyebrow">Module</p>
              <Select value={draft.module || 'all'} onValueChange={(v) => set('module', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODULE_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <ImageUploadField value={draft.image_url} onChange={(v) => set('image_url', v)} label="Cover image" />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!draft.title} onClick={() => onSave(draft)} className="bg-[#6F551A] hover:bg-[#5A4514] text-[#F4EFE3]">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}