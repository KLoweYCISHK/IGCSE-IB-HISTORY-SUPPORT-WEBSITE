import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import RichTextEditor from './editor/RichTextEditor';
import TableEditor from './editor/TableEditor';
import ImageUploadField from './editor/ImageUploadField';

const CATEGORIES = [
  { value: 'approach', label: 'How to Approach' },
  { value: 'mark_scheme', label: 'Mark Scheme' },
  { value: 'question', label: 'Exam Question' },
];

const PAPER2_TYPES = [
  { value: '6_marker', label: '6 Marker' },
  { value: '4_marker', label: '4 Marker' },
  { value: '15_marker', label: '15 Marker' },
];

export default function ExamItemForm({ open, onOpenChange, initial, onSave, section, module }) {
  const [draft, setDraft] = useState(initial || {});
  useEffect(() => { if (open) setDraft(initial || {}); }, [open, initial]);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const cat = draft.category || 'question';
  const titlePlaceholder =
    cat === 'approach' ? 'Question type / title (e.g. 6-marker)'
    : cat === 'mark_scheme' ? 'Mark scheme title (e.g. 6-marker)'
    : 'Exam question';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">{initial?.id ? 'Edit' : 'New'} {CATEGORIES.find((c) => c.value === cat)?.label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-5 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="chrono-eyebrow">Category</Label>
              <Select value={cat} onValueChange={(v) => set('category', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {section === 'paper2' && (
              <div className="space-y-2">
                <Label className="chrono-eyebrow">Question type</Label>
                <Select value={draft.question_type || ''} onValueChange={(v) => set('question_type', v)}>
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    {PAPER2_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <Input value={draft.question || ''} onChange={(e) => set('question', e.target.value)} placeholder={titlePlaceholder} />

          {cat === 'approach' && (
            <>
              <div className="space-y-2">
                <Label className="chrono-eyebrow">Suggested time (minutes)</Label>
                <Input
                  type="number"
                  min="0"
                  value={draft.time_minutes ?? ''}
                  onChange={(e) => set('time_minutes', e.target.value === '' ? null : Number(e.target.value))}
                  placeholder="e.g. 10"
                />
                <p className="text-xs text-foreground/50">Shown as a bubble next to the question.</p>
              </div>
              <div className="space-y-2">
                <p className="chrono-eyebrow">How to approach it</p>
                <RichTextEditor value={draft.approach} onChange={(v) => set('approach', v)} />
              </div>
              <div className="space-y-2">
                <p className="chrono-eyebrow">Annotated example</p>
                <RichTextEditor value={draft.example} onChange={(v) => set('example', v)} />
              </div>
            </>
          )}

          {cat === 'mark_scheme' && (
            <TableEditor
              rows={draft.mark_scheme_rows && draft.mark_scheme_rows.length ? draft.mark_scheme_rows : [['Marks', 'Level descriptor'], ['', '']]}
              onChange={(rows) => set('mark_scheme_rows', rows)}
            />
          )}

          {cat === 'question' && (
            <div className="space-y-4">
              <Input value={draft.topic || ''} onChange={(e) => set('topic', e.target.value)} placeholder="Topic (e.g. emergence, Tsarist policies)" />
              {section === 'paper3' && (
                <div className="space-y-2">
                  <Label className="chrono-eyebrow">Unit</Label>
                  <Select value={draft.module || module || 'russian_revolution'} onValueChange={(v) => set('module', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="russian_revolution">Russian Revolution</SelectItem>
                      <SelectItem value="cold_war">Cold War</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          <ImageUploadField value={draft.image_url} onChange={(v) => set('image_url', v)} label="Concept image (optional)" />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!draft.question} onClick={() => onSave(draft)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}