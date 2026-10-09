import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function IgcseFocusUnitForm({ open, onOpenChange, initial, onSave }) {
  const [draft, setDraft] = useState(initial || {});
  useEffect(() => { if (open) setDraft(initial || {}); }, [open, initial]);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const bullets = Array.isArray(draft.bullet_points) ? draft.bullet_points : [];
  const bulletsText = bullets.join('\n');
  const specified = Array.isArray(draft.specified_content) ? draft.specified_content : [];
  const specifiedText = specified.join('\n');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">{initial?.id ? 'Edit focus unit' : 'Add a focus unit'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label className="chrono-eyebrow">Focus unit / inquiry question</Label>
            <Input
              value={draft.focus_unit || ''}
              onChange={(e) => set('focus_unit', e.target.value)}
              placeholder="e.g. What were the main conditions that led to mass displacement?"
            />
          </div>
          <div className="space-y-2">
            <Label className="chrono-eyebrow">Key bullet points (one per line)</Label>
            <Textarea
              value={bulletsText}
              onChange={(e) => set('bullet_points', e.target.value.split('\n'))}
              placeholder={'Combat operations and allied victory\nPersecution and fear of reprisals\nEconomic factors'}
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label className="chrono-eyebrow">Specified content (one per line)</Label>
            <Textarea
              value={specifiedText}
              onChange={(e) => set('specified_content', e.target.value.split('\n'))}
              placeholder={'Treaty of Versailles terms\nReparations and war guilt\nImpact on German territory'}
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!draft.focus_unit} onClick={() => onSave(draft)} className="bg-[#6F551A] hover:bg-[#5A4514] text-[#F4EFE3]">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}