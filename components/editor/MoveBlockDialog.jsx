import React, { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { store } from '@/api/firebaseClient';
import { moveBlockToSection } from '@/lib/blockDnd';

const WORDS = { ia: 'IA', ee: 'EE', igcse: 'IGCSE', ib: 'IB', hl: 'HL' };
const nice = (w) => WORDS[w] || w.replace(/^([a-z]+)(\d+)$/, '$1 $2').replace(/^./, (c) => c.toUpperCase());
// "paper2_hitler_revision" -> "Paper 2 · Hitler · revision notes"
const pageLabel = (page) => {
  const isNotes = /_revision$/.test(page);
  const words = page.replace(/_revision$/, '').split(/[_-]+/).filter(Boolean).map(nice);
  return words.join(' · ') + (isNotes ? ' · revision notes' : '');
};

// Lets the teacher send a block (image, text, table, link, file) to any section on the site,
// including sections that are closed and so cannot be reached by dragging.
export default function MoveBlockDialog({ block, onOpenChange }) {
  const open = !!block;
  const [sections, setSections] = useState([]);
  const [names, setNames] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState('');
  const [targetId, setTargetId] = useState('');
  const [place, setPlace] = useState('bottom');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let live = true;
    setLoading(true); setTargetId(''); setPlace('bottom'); setPage(block.section);
    Promise.all([
      store.entities.PageSection.list('order'),
      store.entities.IgcseFocusUnit.list().catch(() => []),
    ]).then(([all, units]) => {
      if (!live) return;
      const liveSections = all.filter((s) => !s.is_deleted);
      const map = {};
      units.forEach((u) => { map[u.id] = u.focus_unit; });
      // older "revision topic" cards also act as units
      liveSections.filter((s) => /_revtopics$/.test(s.page)).forEach((s) => { map[s.id] = s.title; });
      setNames(map);
      setSections(liveSections.filter((s) => !/_revtopics$/.test(s.page)));
      setLoading(false);
    }).catch(() => { if (live) { setSections([]); setLoading(false); } });
    return () => { live = false; };
  }, [open, block]);

  const pages = useMemo(() => {
    const keys = [...new Set(sections.map((s) => s.page))].sort((a, b) => pageLabel(a).localeCompare(pageLabel(b)));
    return block && keys.includes(block.section) ? [block.section, ...keys.filter((k) => k !== block.section)] : keys;
  }, [sections, block]);

  const unitName = (module) => {
    if (!module || module === 'all') return '';
    const [id, scope] = module.split('__');
    return names[id] ? (scope ? `${names[id]} (${nice(scope)})` : names[id]) : '';
  };

  // this page's sections, grouped under their unit
  const groups = useMemo(() => {
    const out = [];
    sections.filter((s) => s.page === page).forEach((s) => {
      const key = s.module || 'all';
      let g = out.find((x) => x.key === key);
      if (!g) { g = { key, items: [] }; out.push(g); }
      g.items.push(s);
    });
    return out;
  }, [sections, page]);

  const target = sections.find((s) => s.id === targetId);
  const isCurrent = (s) => block && s.page === block.section && s.slug === block.sub;

  const confirm = async () => {
    if (!target) return;
    setSaving(true);
    try {
      await moveBlockToSection(block, target, place);
      onOpenChange(false);
    } catch { /* the editor has already shown the error */ }
    finally { setSaving(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="font-display text-3xl">Move to another section</DialogTitle>
        </DialogHeader>

        {loading ? <div className="h-40 animate-pulse bg-black/[0.04] rounded" /> : (
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <p className="chrono-eyebrow">Page</p>
              <select
                value={page}
                onChange={(e) => { setPage(e.target.value); setTargetId(''); }}
                className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
              >
                {pages.map((p) => (
                  <option key={p} value={p}>{pageLabel(p)}{block && p === block.section ? ' (this page)' : ''}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <p className="chrono-eyebrow">Section</p>
              <div className="max-h-[42vh] overflow-y-auto rounded-md border border-border divide-y divide-border">
                {groups.length === 0 && <p className="p-4 text-sm text-foreground/60">No sections on this page yet.</p>}
                {groups.map((g) => (
                  <div key={g.key}>
                    {unitName(g.key) && <p className="px-4 pt-3 pb-1 text-xs font-bold text-[#1E40AF]">{unitName(g.key)}</p>}
                    {g.items.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setTargetId(s.id)}
                        aria-pressed={targetId === s.id}
                        className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3 ${targetId === s.id ? 'bg-[#1D4ED8] text-white' : 'hover:bg-[#1D4ED8]/5'}`}
                      >
                        <span>{s.title || s.slug}</span>
                        {isCurrent(s) && <span className={`text-xs ${targetId === s.id ? 'text-white/80' : 'text-muted-foreground'}`}>it is here now</span>}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="chrono-eyebrow">Place it</p>
              <div className="flex gap-2">
                {[['top', 'At the top'], ['bottom', 'At the bottom']].map(([v, label]) => (
                  <Button key={v} type="button" size="sm" variant={place === v ? 'default' : 'outline'} onClick={() => setPlace(v)}>{label}</Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Once it is in the section, drag its handle to put it exactly where you want it.</p>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={confirm} disabled={!target || saving}>{saving ? 'Moving…' : 'Move here'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
