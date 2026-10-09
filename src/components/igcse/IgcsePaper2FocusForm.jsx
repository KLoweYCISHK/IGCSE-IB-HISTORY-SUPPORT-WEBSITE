import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectLabel, SelectItem } from '@/components/ui/select';

const PAGE_LABELS = { igcse_core1: 'Core 1', igcse_core2: 'Core 2' };

export default function IgcsePaper2FocusForm({ open, onOpenChange, initial, focusUnits, onSave }) {
  const [draft, setDraft] = useState(initial || {});
  useEffect(() => { if (open) setDraft(initial || {}); }, [open, initial]);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const grouped = useMemo(() => {
    const g = {};
    (focusUnits || []).forEach((u) => {
      const key = u.page || 'other';
      (g[key] = g[key] || []).push(u);
    });
    return g;
  }, [focusUnits]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">{initial?.id ? 'Edit focus year' : 'Add a focus year'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="chrono-eyebrow">Year</Label>
            <Input
              type="number"
              value={draft.year || ''}
              onChange={(e) => set('year', e.target.value ? Number(e.target.value) : '')}
              placeholder="e.g. 2026"
            />
          </div>
          <div className="space-y-2">
            <Label className="chrono-eyebrow">Topic focus (from Core 1 / Core 2 focus units)</Label>
            <Select
              value={draft.focus_unit_id || ''}
              onValueChange={(v) => set('focus_unit_id', v)}
            >
              <SelectTrigger><SelectValue placeholder="Select a focus unit" /></SelectTrigger>
              <SelectContent>
                {Object.keys(grouped).map((page) => (
                  <SelectGroup key={page}>
                    <SelectLabel>{PAGE_LABELS[page] || page}</SelectLabel>
                    {grouped[page].map((u) => (
                      <SelectItem key={u.id} value={u.id}>{u.focus_unit}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!draft.year || !draft.focus_unit_id} onClick={() => onSave(draft)} className="bg-[#6F551A] hover:bg-[#5A4514] text-[#F4EFE3]">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}