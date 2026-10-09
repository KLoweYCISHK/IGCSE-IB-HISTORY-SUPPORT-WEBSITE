import React, { useEffect, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb, getEditPassword } from '@/api/editor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UNITS } from '@/lib/perspectiveTopics';

export default function AddPerspectiveDialog({ open, onOpenChange, unit, initial, onSaved }) {
  const [draft, setDraft] = useState({});
  const [saving, setSaving] = useState(false);
  useEffect(() => { if (open) setDraft(initial || {}); }, [open, initial]);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const allowUnitSelect = !unit;
  const effectiveUnit = draft.unit || unit;

  const submit = async () => {
    setSaving(true);
    const { id, ...data } = draft;
    const db = getEditPassword() ? editDb : store.entities;
    if (id) await db.Perspective.update(id, data);
    else await db.Perspective.create({ ...data, unit: effectiveUnit });
    setSaving(false);
    onOpenChange(false);
    onSaved();
  };

  const valid = draft.name && draft.topic && draft.argument && effectiveUnit;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">{initial?.id ? 'Edit perspective' : 'Add a perspective'}</DialogTitle>
          <DialogDescription className="font-mono text-[11px] uppercase tracking-[0.2em]">
            {allowUnitSelect ? 'Choose a unit & topic' : UNITS[effectiveUnit]?.label}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {allowUnitSelect && (
            <div className="space-y-1.5">
              <p className="chrono-eyebrow">Unit</p>
              <Select value={draft.unit || ''} onValueChange={(v) => set('unit', v)}>
                <SelectTrigger><SelectValue placeholder="Choose a unit" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(UNITS).map((k) => <SelectItem key={k} value={k}>{UNITS[k].label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <div className="space-y-1.5">
            <p className="chrono-eyebrow">Historian / school of thought</p>
            <Input value={draft.name || ''} onChange={(e) => set('name', e.target.value)} placeholder="e.g. Richard Pipes — Liberal school" />
          </div>
          <div className="space-y-1.5">
            <p className="chrono-eyebrow">Which part of the unit?</p>
            <Select value={draft.topic || ''} onValueChange={(v) => set('topic', v)}>
              <SelectTrigger><SelectValue placeholder="Choose a topic" /></SelectTrigger>
              <SelectContent>
                {(UNITS[effectiveUnit]?.topics || []).map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <p className="chrono-eyebrow">Their argument</p>
            <Textarea rows={5} value={draft.argument || ''} onChange={(e) => set('argument', e.target.value)} placeholder="Summarise the argument in your own words…" />
          </div>
          <div className="space-y-1.5">
            <p className="chrono-eyebrow">Where did you find it?</p>
            <Input value={draft.source_url || ''} onChange={(e) => set('source_url', e.target.value)} placeholder="Link (optional)" />
            <Textarea rows={2} value={draft.source_text || ''} onChange={(e) => set('source_text', e.target.value)} placeholder="…or describe the source (book, page, article)" />
          </div>
          <div className="space-y-1.5">
            <p className="chrono-eyebrow">Your name</p>
            <Input value={draft.student_name || ''} onChange={(e) => set('student_name', e.target.value)} placeholder="Added by" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!valid || saving} onClick={submit} className="bg-[#6F551A] hover:bg-[#5A4514] text-[#F4EFE3]">
            {saving ? 'Saving…' : 'Submit perspective'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}