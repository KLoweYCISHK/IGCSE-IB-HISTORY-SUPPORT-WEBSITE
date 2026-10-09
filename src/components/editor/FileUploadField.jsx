import React, { useState } from 'react';
import { uploadFile } from '@/api/editor';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, X, FileText } from 'lucide-react';

export default function FileUploadField({ value, fileName, onChange, onFileNameChange }) {
  const [busy, setBusy] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    try {
      const { file_url } = await uploadFile({ file });
      onChange(file_url);
      onFileNameChange?.(file.name);
    } finally {
      setBusy(false);
    }
  };

  const clear = () => {
    onChange('');
    onFileNameChange?.('');
  };

  return (
    <div className="space-y-2">
      <p className="chrono-eyebrow">Document (Word or PDF)</p>
      {value ? (
        <div className="flex items-center gap-3 rounded-sm border border-border bg-secondary/40 p-3">
          <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
          <span className="text-sm text-foreground break-all min-w-0">{fileName || value}</span>
          <Button type="button" variant="ghost" size="sm" onClick={clear} className="shrink-0">
            <X className="w-4 h-4 mr-1" /> Remove
          </Button>
        </div>
      ) : null}
      <label className="inline-flex items-center gap-2 text-sm cursor-pointer border border-border rounded px-3 py-2 hover:bg-secondary/50">
        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
        Upload document
        <input
          type="file"
          accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          className="hidden"
          onChange={handleFile}
        />
      </label>
    </div>
  );
}