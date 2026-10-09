import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import RichTextEditor from './RichTextEditor';
import TableEditor from './TableEditor';
import ImageUploadField from './ImageUploadField';
import FileUploadField from './FileUploadField';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function BlockForm({ open, onOpenChange, initial, onSave }) {
  const [draft, setDraft] = useState(initial || {});

  useEffect(() => { if (open) setDraft(initial || {}); }, [open, initial]);

  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">
            {initial?.id ? 'Edit block' : `New ${draft.kind || 'text'} block`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {draft.kind !== 'link' && (
            <div className="space-y-2">
              <p className="chrono-eyebrow">Title (optional)</p>
              <Input value={draft.title || ''} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Unit 1 — Authoritarian States" />
            </div>
          )}

          {draft.kind === 'table' && <TableEditor rows={draft.rows} onChange={(rows) => set('rows', rows)} />}

          {draft.kind === 'link' && (
            <>
              <div className="space-y-2">
                <p className="chrono-eyebrow">Button label</p>
                <Input value={draft.title || ''} onChange={(e) => set('title', e.target.value)} placeholder="e.g. EE Question generator" />
              </div>
              <div className="space-y-2">
                <p className="chrono-eyebrow">Link URL</p>
                <Input value={draft.link_url || ''} onChange={(e) => set('link_url', e.target.value)} placeholder="https://…" />
              </div>
              <div className="space-y-2">
                <p className="chrono-eyebrow">Description (optional)</p>
                <Input value={draft.caption || ''} onChange={(e) => set('caption', e.target.value)} placeholder="e.g. Use the linked question generator to help formulate your question." />
              </div>
              <div className="rounded-sm border border-dashed border-border p-3 space-y-3">
                <p className="chrono-eyebrow">School subscription login (optional)</p>
                <div className="space-y-2">
                  <p className="font-mono text-[11px] text-muted-foreground">Username</p>
                  <Input value={draft.link_username || ''} onChange={(e) => set('link_username', e.target.value)} placeholder="School login username" />
                </div>
                <div className="space-y-2">
                  <p className="font-mono text-[11px] text-muted-foreground">Password</p>
                  <Input value={draft.link_password || ''} onChange={(e) => set('link_password', e.target.value)} placeholder="School login password" />
                </div>
              </div>
            </>
          )}

          {draft.kind === 'image' && (
            <>
              <ImageUploadField value={draft.image_url} onChange={(v) => set('image_url', v)} />
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="chrono-eyebrow">Width</p>
                  <span className="font-mono text-xs text-muted-foreground">{draft.image_width ?? 100}%</span>
                </div>
                <input
                  type="range"
                  min={15}
                  max={100}
                  step={1}
                  value={draft.image_width ?? 100}
                  onChange={(e) => set('image_width', Number(e.target.value))}
                  className="w-full accent-[#6F551A]"
                />
                <p className="font-mono text-[11px] text-muted-foreground/70">Drag to set any width — the image keeps its natural height.</p>
              </div>
              <div className="space-y-2">
                <p className="chrono-eyebrow">Placement</p>
                <Select value={draft.image_layout || 'full'} onValueChange={(v) => set('image_layout', v)}>
                  <SelectTrigger className="w-full"><SelectValue placeholder="Full width" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full">Full width</SelectItem>
                    <SelectItem value="top">Image top, text bottom</SelectItem>
                    <SelectItem value="left">Image left, text right</SelectItem>
                    <SelectItem value="right">Text left, image right</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {draft.image_layout && draft.image_layout !== 'full' && (
                <div className="space-y-2">
                  <p className="chrono-eyebrow">Text beside image</p>
                  <RichTextEditor value={draft.html} onChange={(v) => set('html', v)} />
                </div>
              )}
              <Input value={draft.caption || ''} onChange={(e) => set('caption', e.target.value)} placeholder="Caption" />
            </>
          )}

          {draft.kind === 'file' && (
            <>
              <div className="space-y-2">
                <p className="chrono-eyebrow">Button label (optional)</p>
                <Input value={draft.title || ''} onChange={(e) => set('title', e.target.value)} placeholder="e.g. EE Proposal template" />
              </div>
              <FileUploadField
                value={draft.file_url}
                fileName={draft.file_name}
                onChange={(v) => set('file_url', v)}
                onFileNameChange={(v) => set('file_name', v)}
              />
              <div className="space-y-2">
                <p className="chrono-eyebrow">Description (optional)</p>
                <Input value={draft.caption || ''} onChange={(e) => set('caption', e.target.value)} placeholder="What students should do with this document." />
              </div>
            </>
          )}

          {(!draft.kind || draft.kind === 'text') && (
            <div className="space-y-2">
              <p className="chrono-eyebrow">Content</p>
              <RichTextEditor value={draft.html} onChange={(v) => set('html', v)} />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave(draft)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}