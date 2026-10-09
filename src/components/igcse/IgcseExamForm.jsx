import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import RichTextEditor from '@/components/editor/RichTextEditor';
import TableEditor from '@/components/editor/TableEditor';
import { QUESTION_TYPES, genericLevels } from '@/lib/igcseMarkSchemes';

const CATEGORIES = [
  { value: 'approach', label: 'How to Approach' },
  { value: 'question', label: 'Exam Question' },
];

export default function IgcseExamForm({ open, onOpenChange, initial, onSave, genericLevelsFor, topics = [] }) {
  const [draft, setDraft] = useState(initial || {});
  useEffect(() => { if (open) setDraft(initial || {}); }, [open, initial]);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  const cat = draft.category || 'question';
  const qType = draft.question_type || '6_marker';
  const genericFor = (type) => (genericLevelsFor || genericLevels)(type);
  const topicOptions = Array.from(new Set([...topics, draft.topic].filter(Boolean))).sort();

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
            <div className="space-y-2">
              <Label className="chrono-eyebrow">Question type</Label>
              <Select value={qType} onValueChange={(v) => { set('question_type', v); if (cat === 'question' && !draft.id) set('mark_scheme_rows', genericFor(v)); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {QUESTION_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Input
            value={draft.question || ''}
            onChange={(e) => set('question', e.target.value)}
            placeholder={cat === 'approach' ? 'Title (e.g. How to approach a 6-marker)' : 'Exam question'}
          />

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

          {cat === 'question' && (
            <>
              <div className="space-y-2">
                <Label className="chrono-eyebrow">Focus unit (topic)</Label>
                <Select value={draft.topic || ''} onValueChange={(v) => set('topic', v)}>
                  <SelectTrigger><SelectValue placeholder="Choose a focus unit" /></SelectTrigger>
                  <SelectContent>
                    {topicOptions.length === 0 && (
                      <SelectItem value={null} disabled>Add focus units on the topic pages first</SelectItem>
                    )}
                    {topicOptions.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-xs text-foreground/50">Topics come from the Focus units tables on the core & depth pages.</p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="chrono-eyebrow">Mark scheme levels</p>
                  <Button type="button" size="sm" variant="ghost" onClick={() => set('mark_scheme_rows', genericFor(qType))}>
                    Insert generic levels
                  </Button>
                </div>
                <TableEditor
                  rows={draft.mark_scheme_rows && draft.mark_scheme_rows.length ? draft.mark_scheme_rows : genericFor(qType)}
                  onChange={(rows) => set('mark_scheme_rows', rows)}
                />
                <p className="text-xs text-foreground/50">Generic levels are pre-filled — edit each level to add the specific knowledge and examples for this question.</p>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!draft.question} onClick={() => onSave(draft)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}