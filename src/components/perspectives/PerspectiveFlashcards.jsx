import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shuffle, RotateCcw } from 'lucide-react';
import { historianName, schoolOf } from '@/lib/perspectiveTopics';
import { setFlag, useProgress } from '@/lib/progress';
import { SchoolTag } from './PerspectiveCard';

const shuffled = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

export default function PerspectiveFlashcards({ items }) {
  const { known } = useProgress();
  const [deck, setDeck] = useState(items);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [onlyLearning, setOnlyLearning] = useState(false);

  const ids = items.map((i) => i.id).join(',');
  useEffect(() => { setDeck(items); setIndex(0); setFlipped(false); }, [ids]); // eslint-disable-line react-hooks/exhaustive-deps

  const cards = useMemo(() => (onlyLearning ? deck.filter((c) => !known[c.id]) : deck), [deck, onlyLearning, known]);
  const knownCount = items.filter((i) => known[i.id]).length;

  if (!items.length) return <p className="text-foreground/60">No perspectives match these filters yet.</p>;

  const card = cards[Math.min(index, cards.length - 1)];
  const answer = (gotIt) => {
    setFlag('known', card.id, gotIt);
    setFlipped(false);
    // when "Got it" removes the card from a learning-only deck, the next card slides into this position
    if (!(onlyLearning && gotIt)) setIndex((i) => (i + 1) % Math.max(cards.length, 1));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>{knownCount} of {items.length} known</span>
          <label className="inline-flex items-center gap-2 font-normal text-foreground/70">
            <input type="checkbox" checked={onlyLearning} onChange={(e) => { setOnlyLearning(e.target.checked); setIndex(0); setFlipped(false); }} className="w-4 h-4 accent-[#1D4ED8]" />
            Only cards I'm still learning
          </label>
        </div>
        <div className="h-2.5 rounded-full bg-border overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={items.length} aria-valuenow={knownCount} aria-label="Historians known">
          <div className="h-full bg-[#1D4ED8] transition-all" style={{ width: `${(knownCount / items.length) * 100}%` }} />
        </div>
      </div>

      {!card ? (
        <div className="rounded-sm border border-border bg-card p-10 text-center space-y-4">
          <p className="font-display text-3xl">You know every card in this set.</p>
          <Button variant="outline" onClick={() => setOnlyLearning(false)}><RotateCcw className="w-4 h-4 mr-1.5" /> Go through them all again</Button>
        </div>
      ) : (
        <>
          <button onClick={() => setFlipped((f) => !f)} aria-label={flipped ? 'Show the question' : 'Show the answer'} className="flip block w-full text-left">
            <div className={`flip-inner ${flipped ? 'is-flipped' : ''}`}>
              <div className="flip-face min-h-[300px] rounded-sm bg-[#C2410C] text-white p-8 flex flex-col justify-between gap-6" aria-hidden={flipped}>
                <span className="text-xs font-semibold uppercase tracking-[0.12em]">Who argued this? · {card.topic}</span>
                <span className="font-display text-2xl md:text-3xl leading-snug">{card.argument}</span>
                <span className="text-sm font-semibold">Tap to flip</span>
              </div>
              <div className="flip-face flip-back rounded-sm bg-[#111827] text-white p-8 flex flex-col justify-center gap-4 overflow-y-auto" aria-hidden={!flipped}>
                <span><SchoolTag item={card} /></span>
                <span className="font-display text-4xl leading-tight">{historianName(card)}</span>
                {schoolOf(card) && <span className="text-white/80">{schoolOf(card)} school · {card.topic}</span>}
              </div>
            </div>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 text-base" onClick={() => answer(false)}>Still learning</Button>
            <Button className="h-12 text-base bg-[#1D4ED8] hover:bg-[#1E40AF] text-white" onClick={() => answer(true)}>Got it</Button>
          </div>
          <div className="flex items-center justify-between text-sm text-foreground/60">
            <span>Card {Math.min(index, cards.length - 1) + 1} of {cards.length}</span>
            <button onClick={() => { setDeck(shuffled(deck)); setIndex(0); setFlipped(false); }} className="inline-flex items-center gap-1.5 font-semibold text-[#1D4ED8]">
              <Shuffle className="w-4 h-4" /> Shuffle
            </button>
          </div>
        </>
      )}
    </div>
  );
}
