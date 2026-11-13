import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb, getEditPassword } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search, LayoutGrid, Layers, CircleHelp, Star, X } from 'lucide-react';
import { UNITS, schoolOf } from '@/lib/perspectiveTopics';
import { matchesQuery } from '@/lib/highlight';
import { useProgress } from '@/lib/progress';
import PerspectiveCard from './PerspectiveCard';
import PerspectiveFlashcards from './PerspectiveFlashcards';
import PerspectiveQuiz from './PerspectiveQuiz';
import CompareDialog from './CompareDialog';
import AddPerspectiveDialog from './AddPerspectiveDialog';

const MODES = [
  { key: 'browse', label: 'Browse', icon: LayoutGrid },
  { key: 'flashcards', label: 'Flashcards', icon: Layers },
  { key: 'quiz', label: 'Quiz me', icon: CircleHelp },
  { key: 'saved', label: 'My essay toolkit', icon: Star },
];

function Chip({ active, onClick, children }) {
  return (
    <button onClick={onClick} aria-pressed={active}
      className={`min-h-[40px] rounded-full px-4 text-sm font-semibold transition-colors ${
        active ? 'bg-[#1D4ED8] text-white' : 'border border-border text-foreground/75 hover:border-[#1D4ED8]'
      }`}>
      {children}
    </button>
  );
}

export default function PerspectiveEngine({ unit }) {
  const { isAdmin, user } = useAdmin();
  const { saved } = useProgress();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('browse');
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('all');
  const [school, setSchool] = useState('all');
  const [editing, setEditing] = useState(null);
  const [compare, setCompare] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);

  const load = useCallback(async () => {
    try { setItems(await store.entities.Perspective.filter({ unit }, '-created_date')); }
    finally { setLoading(false); }
  }, [unit]);

  useEffect(() => { setQuery(''); setTopic('all'); setSchool('all'); setCompare([]); load(); }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener('perspectives:reload', handler);
    return () => window.removeEventListener('perspectives:reload', handler);
  }, [load]);

  const topicCounts = useMemo(() => {
    const counts = {};
    items.forEach((i) => { counts[i.topic] = (counts[i.topic] || 0) + 1; });
    return counts;
  }, [items]);
  const schools = useMemo(() => {
    const known = UNITS[unit].schools || [];
    const present = [...new Set(items.map(schoolOf).filter(Boolean))];
    return [...known.filter((s) => present.includes(s)), ...present.filter((s) => !known.includes(s))];
  }, [items, unit]);

  const filtered = useMemo(
    () => items.filter((i) =>
      (topic === 'all' || i.topic === topic) &&
      (school === 'all' || schoolOf(i) === school) &&
      (mode !== 'saved' || saved[i.id]) &&
      matchesQuery([i.name, i.topic, i.argument, i.source_text, schoolOf(i)].filter(Boolean).join(' '), query)
    ),
    [items, topic, school, query, mode, saved]
  );

  const toggleCompare = (item) => setCompare((c) => {
    if (c.some((x) => x.id === item.id)) return c.filter((x) => x.id !== item.id);
    const next = [...c, item].slice(-2);
    if (next.length === 2) setCompareOpen(true);
    return next;
  });

  const savedCount = items.filter((i) => saved[i.id]).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div role="tablist" aria-label="Ways to study the historians" className="flex flex-wrap gap-2">
          {MODES.map((m) => (
            <button key={m.key} role="tab" aria-selected={mode === m.key} onClick={() => { setMode(m.key); setCompare([]); }}
              className={`inline-flex items-center gap-2 min-h-[44px] rounded-full px-5 text-sm font-bold transition-colors ${
                mode === m.key ? 'bg-[#111827] text-white' : 'border border-border hover:border-[#111827]'
              }`}>
              <m.icon className="w-4 h-4" /> {m.label}{m.key === 'saved' && savedCount > 0 ? ` (${savedCount})` : ''}
            </button>
          ))}
        </div>
        <Button className="h-11 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white" onClick={() => setEditing({ student_name: user?.full_name || '' })}>
          <Plus className="w-4 h-4 mr-1.5" /> Add perspective
        </Button>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search the historians bank"
            placeholder="Search historians, schools of thought, arguments…" className="pl-11 h-12 text-base bg-background" />
        </div>
        <div className="flex flex-wrap gap-2" aria-label="Filter by topic">
          <Chip active={topic === 'all'} onClick={() => setTopic('all')}>All topics</Chip>
          {UNITS[unit].topics.map((t) => (
            <Chip key={t} active={topic === t} onClick={() => setTopic(topic === t ? 'all' : t)}>
              {t}{topicCounts[t] ? ` · ${topicCounts[t]}` : ''}
            </Chip>
          ))}
        </div>
        {schools.length > 0 && (
          <div className="flex flex-wrap items-center gap-2" aria-label="Filter by school of thought">
            <span className="chrono-eyebrow mr-1">School</span>
            <Chip active={school === 'all'} onClick={() => setSchool('all')}>All</Chip>
            {schools.map((s) => <Chip key={s} active={school === s} onClick={() => setSchool(school === s ? 'all' : s)}>{s}</Chip>)}
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-24 animate-pulse bg-black/[0.04] rounded" />
      ) : mode === 'flashcards' ? (
        <PerspectiveFlashcards items={filtered} />
      ) : mode === 'quiz' ? (
        <PerspectiveQuiz items={filtered} pool={items} />
      ) : (
        <>
          <p className="chrono-eyebrow">
            {filtered.length} perspective{filtered.length === 1 ? '' : 's'}{topic !== 'all' ? ` · ${topic}` : ''}{school !== 'all' ? ` · ${school}` : ''}
          </p>
          {filtered.length === 0 ? (
            <p className="text-foreground/60">
              {mode === 'saved'
                ? 'Nothing saved yet. Tap the star on a historian to keep them here for your essays.'
                : 'No perspectives found. Be the first to add one.'}
            </p>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {filtered.map((item) => (
                <PerspectiveCard
                  key={item.id}
                  item={item}
                  query={query}
                  canManage={isAdmin || (user && item.created_by_id === user.id)}
                  onEdit={() => setEditing(item)}
                  onDelete={async () => { await (getEditPassword() ? editDb : store.entities).Perspective.delete(item.id); load(); }}
                  comparing={compare.some((c) => c.id === item.id)}
                  onCompare={() => toggleCompare(item)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {compare.length > 0 && !compareOpen && (mode === 'browse' || mode === 'saved') && (
        <div className="sticky bottom-20 z-30 mx-auto w-fit max-w-full flex items-center gap-3 rounded-full bg-[#111827] text-white pl-5 pr-2 py-2 shadow-xl">
          <span className="text-sm font-semibold">
            {compare.length === 1 ? 'Pick one more historian to compare' : 'Two historians selected'}
          </span>
          {compare.length === 2 && (
            <Button size="sm" className="bg-white text-[#111827] hover:bg-white/90" onClick={() => setCompareOpen(true)}>Compare</Button>
          )}
          <button onClick={() => setCompare([])} aria-label="Clear comparison" className="p-2 rounded-full hover:bg-white/10"><X className="w-4 h-4" /></button>
        </div>
      )}

      <CompareDialog items={compare} open={compareOpen && compare.length === 2} onOpenChange={setCompareOpen} />

      <AddPerspectiveDialog
        open={!!editing}
        onOpenChange={(o) => !o && setEditing(null)}
        unit={unit}
        initial={editing}
        onSaved={load}
      />
    </div>
  );
}
