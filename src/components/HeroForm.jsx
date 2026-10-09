import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import RichTextEditor from './editor/RichTextEditor';
import ImageUploadField from './editor/ImageUploadField';

export default function HeroForm({ open, onOpenChange, initial, onSave }) {
  const [draft, setDraft] = useState(initial || {});

  useEffect(() => { if (open) setDraft(initial || {}); }, [open, initial]);

  const set = (k) => (e) => setDraft((d) => ({ ...d, [k]: e.target.value }));
  const setVal = (k) => (v) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Edit hero</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label>Eyebrow</Label>
            <Input value={draft.eyebrow || ''} onChange={set('eyebrow')} />
          </div>
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input value={draft.title || ''} onChange={set('title')} />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <RichTextEditor value={draft.description || ''} onChange={setVal('description')} />
          </div>
          <div className="space-y-1.5">
            <Label>Background image URL</Label>
            <Input value={draft.image_url || ''} onChange={set('image_url')} />
          </div>
          <ImageUploadField
            label="Side image (shown to the right of the title)"
            value={draft.side_image_url || ''}
            onChange={setVal('side_image_url')}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button className="bg-[#6F551A] hover:bg-[#5A4514] text-[#F4EFE3]" onClick={() => onSave(draft)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}