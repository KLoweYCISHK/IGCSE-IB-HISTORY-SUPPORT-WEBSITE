import React, { useState } from 'react';
import { uploadFile } from '@/api/editor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Upload, X } from 'lucide-react';

export default function ImageUploadField({ value, onChange, label = 'Image' }) {
  const [busy, setBusy] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    const { file_url } = await uploadFile({ file });
    onChange(file_url);
    setBusy(false);
  };

  return (
    <div className="space-y-2">
      <p className="chrono-eyebrow">{label}</p>
      {value ? (
        <div className="flex items-center gap-3">
          <img src={value} alt="" className="h-16 w-24 object-cover rounded border border-border" />
          <Button type="button" variant="ghost" size="sm" onClick={() => onChange('')}>
            <X className="w-4 h-4 mr-1" /> Remove
          </Button>
        </div>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        <label className="inline-flex items-center gap-2 text-sm cursor-pointer border border-border rounded px-3 py-2 hover:bg-secondary/50">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
          Upload
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
        <Input
          placeholder="…or paste an image URL"
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-[200px]"
        />
      </div>
    </div>
  );
}