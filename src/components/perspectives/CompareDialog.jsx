import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { historianName } from '@/lib/perspectiveTopics';
import { SchoolTag } from './PerspectiveCard';

export default function CompareDialog({ items, open, onOpenChange }) {
  const [a, b] = items;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">Compare two historians</DialogTitle>
          <DialogDescription>Read them side by side, then use the sentence below to link them in a paragraph.</DialogDescription>
        </DialogHeader>
        {a && b && (
          <div className="space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              {[a, b].map((item) => (
                <div key={item.id} className="rounded-sm border border-border bg-card p-5 space-y-3">
                  <SchoolTag item={item} />
                  <p className="font-display text-2xl leading-tight">{item.name}</p>
                  <p className="text-xs font-semibold text-foreground/60">{item.topic}</p>
                  <p className="leading-relaxed">{item.argument}</p>
                </div>
              ))}
            </div>
            <div className="rounded-sm bg-[#1D4ED8]/10 p-5 space-y-2">
              <p className="chrono-eyebrow text-[#1E40AF]">Link them in an essay</p>
              <p>While {historianName(a)} argues that …, {historianName(b)} contends that …</p>
              <p>Both {historianName(a)} and {historianName(b)} agree that …, but they differ on …</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
