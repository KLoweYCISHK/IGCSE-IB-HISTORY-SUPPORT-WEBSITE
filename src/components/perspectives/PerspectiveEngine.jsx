import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb, getEditPassword } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { UNITS } from '@/lib/perspectiveTopics';
import { matchesQuery } from '@/lib/highlight';
import PerspectiveCard from './PerspectiveCard';
import AddPerspectiveDialog from './AddPerspectiveDialog';

export default function PerspectiveEngine({ unit }) {
  const { isAdmin, user } = useAdmin();
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('all');
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    setItems(await store.entities.Perspective.filter({ unit }, '-created_date'));
  }, [unit]);

  useEffect(() => { setQuery(''); setTopic('all'); load(); }, [load]);

  useEffect(() => {
    const handler = () => load();
    window.addEventListener('perspectives:reload', handler);
    return () => window.removeEventListener('perspectives:reload', handler);
  }, [load]);

  const filtered = useMemo(
    () => items.filter((i) =>
      (topic === 'all' || i.topic === topic) &&
      matchesQuery([i.name, i.topic, i.argument, i.source_text].filter(Boolean).join(' '), query)
    ),
    [items, topic, query]
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search historians, schools of thought, arguments…"
            className="pl-11 h-12 text-base bg-transparent"
          />
        </div>
        <Select value={topic} onValueChange={setTopic}>
          <SelectTrigger className="h-12 lg:w-72"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All topics</SelectItem>
            {UNITS[unit].topics.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button className="h-12 bg-[#6F551A] hover:bg-[#5A4514] text-[#F4EFE3]" onClick={() => setEditing({ student_name: user?.full_name || '' })}>
          <Plus className="w-4 h-4 mr-1.5" /> Add perspective
        </Button>
      </div>

      <p className="chrono-eyebrow">
        {filtered.length} perspective{filtered.length === 1 ? '' : 's'}{topic !== 'all' ? ` — ${topic}` : ''}
      </p>

      {filtered.length === 0 ? (
        <p className="text-foreground/40 italic">No perspectives found. Be the first to add one.</p>
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
            />
          ))}
        </div>
      )}

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