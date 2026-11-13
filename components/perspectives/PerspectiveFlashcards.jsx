import React, { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Shuffle, RotateCcw } from 'lucide-react';
import { historianName, schoolOf, schoolStyle, maskSchools } from '@/lib/perspectiveTopics';
import { setFlag, useProgress } from '@/lib/progress';

const shuffled = (list) => {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
};

// Two decks, both about ideas and schools rather than names:
//  - "Name the school": an idea is shown, the student says which school of thought it belongs to.
//  - "Recall the ideas": a school is shown, the student recalls what it argues.
function buildDecks(items) {
  const withSchool = items.filter((i) => schoolOf(i));
  const name = withSchool.map((i) => ({ id: i.id, kind: 'name', item: i, school: schoolOf(i) }));
  const bySchool = new Map();
  withSchool.forEach((i) => { const k = `${schoolOf(i)}|${i.topic}`; bySchool.set(k, [...(bySchool.get(k) || []), i]); });
  const recall = [...bySchool.entries()].map(([k, list]) => ({
    id: `recall:${list[0].unit}:${k}`, kind: 'recall', school: schoolOf(list[0]), topic: list[0].topic, unit: list[0].unit, list,
  }));
  return { name, recall };
}

export default function PerspectiveFlashcards({ items }) {
  const { known } = useProgress();
  const decks = useMemo(() => buildDecks(items), [items]);
  const [mode, setMode] = useState('name');
  const [order, setOrder] = useState([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [onlyLearning, setOnlyLearning] = useState(false);

  const deck = decks[mode];
  const ids = deck.map((c) => c.id).join(',');
  useEffect(() => { setOrder(deck); setIndex(0); setFlipped(false); }, [ids]); // eslint-disable-line react-hooks/exhaustive-deps

  const cards = useMemo(() => (onlyLearning ? order.filter((c) => !known[c.id]) : order), [order, onlyLearning, known]);
  const knownCount = deck.filter((c) => known[c.id]).length;
  const missing = items.length - items.filter((i) => schoolOf(i)).length;

  if (!deck.length) {
    return <p className="text-foreground/60">Flashcards use the school of thought on each idea. None of the ideas in this selection has a school set yet.</p>;
  }

  const card = cards[Math.min(index, cards.length - 1)];
  const answer = (gotIt) => {
    setFlag('known', card.id, gotIt);
    setFlipped(false);
    // when "Got it" removes the card from a learning-only deck, the next card slides into this position
    if (!(onlyLearning && gotIt)) setIndex((i) => (i + 1) % Math.max(cards.length, 1));
  };
  const tag = (c) => <span className={`self-start rounded-full px-4 py-1.5 text-sm font-bold ${schoolStyle(c.unit || c.item.unit, c.school)}`}>{c.school} school</span>;

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div role="tablist" aria-label="Flashcard type" className="flex flex-wrap gap-2">
        {[['name', 'Name the school'], ['recall', 'Recall the ideas']].map(([k, label]) => (
          <button key={k} role="tab" aria-selected={mode === k} onClick={() => setMode(k)}
            className={`min-h-[40px] rounded-full px-4 text-sm font-bold ${mode === k ? 'bg-[#1D4ED8] text-white' : 'border border-border hover:border-[#1D4ED8]'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold">
          <span>{knownCount} of {deck.length} known</span>
          <label className="inline-flex items-center gap-2 font-normal text-foreground/70">
            <input type="checkbox" checked={onlyLearning} onChange={(e) => { setOnlyLearning(e.target.checked); setIndex(0); setFlipped(false); }} className="w-4 h-4 accent-[#1D4ED8]" />
            Only cards I'm still learning
          </label>
        </div>
        <div className="h-2.5 rounded-full bg-border overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={deck.length} aria-valuenow={knownCount} aria-label="Cards known">
          <div className="h-full bg-[#1D4ED8] transition-all" style={{ width: `${(knownCount / deck.length) * 100}%` }} />
        </div>
      </div>

      {!card ? (
        <div className="rounded-sm border border-border bg-card p-10 text-center space-y-4">
          <p className="font-display text-3xl">You know every card in this set.</p>
          <Button variant="outline" onClick={() => setOnlyLearning(false)}><RotateCcw className="w-4 h-4 mr-1.5" /> Go through them all again</Button>
        </div>
      ) : (
        <>
          <button onClick={() => setFlipped((f) => !f)} aria-label={flipped ? 'Show the question' : 'Show the answer'} className="block w-full text-left">
            {!flipped ? (
              <div className="min-h-[300px] rounded-sm bg-[#C2410C] text-white p-8 flex flex-col justify-between gap-6">
                <span className="text-xs font-semibold uppercase tracking-[0.12em]">
                  {card.kind === 'name' ? `Which school of thought? · ${card.item.topic}` : `Recall the ideas · ${card.topic}`}
                </span>
                <span className="font-display text-2xl md:text-3xl leading-snug">
                  {card.kind === 'name' ? maskSchools(card.item.argument, card.item.unit) : `What do ${card.school.toLowerCase()} historians argue about ${card.topic}?`}
                </span>
                <span className="text-sm font-semibold">Say your answer, then tap to check</span>
              </div>
            ) : (
              <div className="min-h-[300px] rounded-sm bg-[#111827] text-white p-8 flex flex-col justify-center gap-4">
                {tag(card)}
                {card.kind === 'name' ? (
                  <>
                    <span className="font-display text-4xl leading-tight">{card.school}</span>
                    {historianName(card.item).toLowerCase() !== card.school.toLowerCase() && (
                      <span className="text-white/80 text-sm">Example historian: {historianName(card.item)}</span>
                    )}
                  </>
                ) : (
                  <ul className="space-y-3 list-disc pl-5 leading-relaxed">
                    {card.list.map((i) => <li key={i.id}>{i.argument}</li>)}
                  </ul>
                )}
              </div>
            )}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" className="h-12 text-base" onClick={() => answer(false)}>Still learning</Button>
            <Button className="h-12 text-base bg-[#1D4ED8] hover:bg-[#1E40AF] text-white" onClick={() => answer(true)}>Got it</Button>
          </div>
          <div className="flex items-center justify-between text-sm text-foreground/60">
            <span>Card {Math.min(index, cards.length - 1) + 1} of {cards.length}</span>
            <button onClick={() => { setOrder(shuffled(order)); setIndex(0); setFlipped(false); }} className="inline-flex items-center gap-1.5 font-semibold text-[#1D4ED8]">
              <Shuffle className="w-4 h-4" /> Shuffle
            </button>
          </div>
        </>
      )}

      {missing > 0 && <p className="text-sm text-foreground/60">{missing} idea{missing === 1 ? ' is' : 's are'} left out because no school of thought is set on {missing === 1 ? 'it' : 'them'} yet.</p>}
    </div>
  );
}
