import React, { useEffect, useState } from 'react';
import { uploadFile } from '@/api/editor';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, FileText } from 'lucide-react';

const IA_SECTIONS = [
  { key: '1', label: 'Section A · Historical Inquiry Question', max: 6 },
  { key: '2', label: 'Section B · Sources & perspective', max: 6 },
  { key: '3', label: 'Section C · Synthesis & evaluation', max: 12 },
];

export default function DocumentForm({ open, onOpenChange, initial, onSave, section }) {
  const [draft, setDraft] = useState(initial || {});
  const [busy, setBusy] = useState(false);
  useEffect(() => { if (open) setDraft({ ...(initial || {}) }); }, [open, initial]);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { file_url } = await uploadFile({ file });
      set('file_url', file_url);
      set('file_name', file.name);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">{initial?.id ? 'Edit document' : 'Add a document'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <Input value={draft.title || ''} onChange={(e) => set('title', e.target.value)} placeholder="Title" />
          <Textarea value={draft.description || ''} onChange={(e) => set('description', e.target.value)} placeholder="Short description (optional)" rows={2} />
          {section === 'ia' && (
            <div className="space-y-4 border-t border-border pt-4">
              <p className="chrono-eyebrow">IA marks breakdown</p>
              {IA_SECTIONS.map((s) => (
                <div key={s.key} className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-foreground/70 flex-1">{s.label}</span>
                    <Input
                      type="number"
                      min="0"
                      max={s.max}
                      value={draft[`mark_${s.key}`] ?? ''}
                      onChange={(e) => set(`mark_${s.key}`, e.target.value === '' ? '' : Number(e.target.value))}
                      placeholder={`/ ${s.max}`}
                      className="w-20"
                    />
                  </div>
                  <Textarea
                    value={draft[`reason_${s.key}`] || ''}
                    onChange={(e) => set(`reason_${s.key}`, e.target.value)}
                    placeholder={`Why it earned this mark`}
                    rows={2}
                  />
                </div>
              ))}
            </div>
          )}
          <div className="space-y-2">
            <p className="chrono-eyebrow">File (PDF or Word)</p>
            {draft.file_url ? (
              <div className="flex items-center gap-3 border border-border rounded px-3 py-2.5 bg-secondary/40">
                <FileText className="w-5 h-5 text-[#6F551A] shrink-0" />
                <span className="text-sm truncate flex-1">{draft.file_name || 'Uploaded file'}</span>
                <Button type="button" variant="ghost" size="sm" onClick={() => { set('file_url', ''); set('file_name', ''); }}>
                  <X className="w-4 h-4 mr-1" /> Remove
                </Button>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 text-sm cursor-pointer border border-border rounded px-3 py-2.5 hover:bg-secondary/50">
                {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload PDF or Word
                <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" className="hidden" onChange={handleFile} disabled={busy} />
              </label>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!draft.title || !draft.file_url} onClick={() => onSave(draft)} className="bg-[#6F551A] hover:bg-[#5A4514] text-[#F4EFE3]">Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}