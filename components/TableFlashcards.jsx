import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Layers, Shuffle } from 'lucide-react';
import { stripPasteArtifacts } from '@/lib/sanitizeHtml';

const hasText = (html) => String(html || '').replace(/<[^>]*>|&nbsp;/g, '').trim().length > 0;

// Any two-column table (term + meaning, question + answer) can be studied as flashcards.
export const canFlashcard = (rows = []) =>
  rows.length >= 3 && rows[0].length === 2 && rows.slice(1).filter((r) => hasText(r[0]) && hasText(r[1])).length >= 2;

export default function TableFlashcards({ rows, title }) {
  const [open, setOpen] = useState(false);
  const [cards, setCards] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const start = () => {
    setCards(rows.slice(1).filter((r) => hasText(r[0]) && hasText(r[1])));
    setIndex(0); setFlipped(false); setOpen(true);
  };
  const go = (d) => { setFlipped(false); setIndex((i) => (i + d + cards.length) % cards.length); };
  const shuffle = () => {
    const a = [...cards];
    for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
    setCards(a); setIndex(0); setFlipped(false);
  };
  const card = cards[index];
  const cell = (html) => <span className="prose-archive !text-inherit block" dangerouslySetInnerHTML={{ __html: stripPasteArtifacts(String(html).replace(/&nbsp;/g, ' ')) }} />;

  return (
    <>
      <button onClick={start} className="mb-3 inline-flex items-center gap-2 min-h-[40px] rounded-full bg-[#1D4ED8] px-4 text-sm font-bold text-white hover:bg-[#1E40AF]">
        <Layers className="w-4 h-4" /> Test yourself with flashcards
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">{title || 'Flashcards'}</DialogTitle>
            <DialogDescription>Card {index + 1} of {cards.length}. Say the answer to yourself, then flip to check.</DialogDescription>
          </DialogHeader>
          {card && (
            <div className="space-y-4">
              <button onClick={() => setFlipped((f) => !f)} aria-label={flipped ? 'Show the front' : 'Show the answer'} className="block w-full text-left">
                <div className={`min-h-[220px] rounded-sm p-7 flex flex-col justify-between gap-4 ${flipped ? 'bg-[#111827] text-white' : 'bg-[#1D4ED8] text-white'}`}>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em]">{flipped ? rows[0][1] : rows[0][0]}</span>
                  <span className={flipped ? 'text-lg leading-relaxed' : 'font-display text-3xl leading-tight'}>{cell(flipped ? card[1] : card[0])}</span>
                  <span className="text-sm font-semibold">{flipped ? 'Tap to see the front' : 'Tap to flip'}</span>
                </div>
              </button>
              <div className="flex items-center justify-between gap-3">
                <Button variant="outline" onClick={() => go(-1)}>Back</Button>
                <button onClick={shuffle} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1D4ED8]"><Shuffle className="w-4 h-4" /> Shuffle</button>
                <Button className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white" onClick={() => go(1)}>Next</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
