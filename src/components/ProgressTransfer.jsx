import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Smartphone, Copy, Check } from 'lucide-react';
import { exportCode, importCode } from '@/lib/progress';

// Progress is saved in this browser. A code moves it to another device without an account.
export default function ProgressTransfer() {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [paste, setPaste] = useState('');
  const [result, setResult] = useState(null);

  const show = () => { setCode(exportCode()); setCopied(false); setPaste(''); setResult(null); setOpen(true); };
  const copy = async () => { try { await navigator.clipboard.writeText(code); setCopied(true); } catch { /* select and copy by hand */ } };

  return (
    <>
      <button onClick={show} className="inline-flex items-center gap-2 text-sm font-semibold text-[#1D4ED8] hover:underline">
        <Smartphone className="w-4 h-4" /> Move my progress to another device
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Move my progress</DialogTitle>
            <DialogDescription>Your ticks, saved historians and flashcard progress are stored on this device only. Copy this code and paste it on your other device.</DialogDescription>
          </DialogHeader>
          <div className="space-y-5">
            <div className="space-y-2">
              <p className="chrono-eyebrow">1 · Copy the code from this device</p>
              <Textarea readOnly rows={3} value={code} onFocus={(e) => e.target.select()} aria-label="My progress code" className="text-xs break-all" />
              <Button onClick={copy} className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white">
                {copied ? <Check className="w-4 h-4 mr-1.5" /> : <Copy className="w-4 h-4 mr-1.5" />}{copied ? 'Copied' : 'Copy code'}
              </Button>
            </div>
            <div className="space-y-2 border-t border-border pt-5">
              <p className="chrono-eyebrow">2 · Or paste a code from another device</p>
              <Textarea rows={3} value={paste} onChange={(e) => { setPaste(e.target.value); setResult(null); }} aria-label="Paste a progress code" placeholder="Paste your code here" className="text-xs break-all" />
              <Button variant="outline" disabled={!paste.trim()} onClick={() => setResult(importCode(paste) ? 'ok' : 'bad')}>Add to this device</Button>
              <p aria-live="polite" className="text-sm font-semibold">
                {result === 'ok' && 'Done. Your progress has been added to this device.'}
                {result === 'bad' && "That code didn't work. Copy the whole code and try again."}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
