import React, { useCallback, useEffect, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import SectionHeading from '@/components/SectionHeading';
import { QUESTION_TYPES, genericLevels } from '@/lib/igcseMarkSchemes';

function PlainTable({ rows, onChange }) {
  const grid = rows?.length ? rows : [['Level', 'Description', 'Marks'], ['', '', '']];
  const cols = Math.max(...grid.map((r) => r.length));
  const setCell = (r, c, v) => {
    const next = grid.map((row) => [...row]);
    next[r][c] = v;
    onChange(next);
  };
  return (
    <div className="space-y-3">
      <p className="chrono-eyebrow">Level descriptors — first row is the header</p>
      <div className="overflow-x-auto">
        <table className="border-collapse">
          <tbody>
            {grid.map((row, r) => (
              <tr key={r}>
                {Array.from({ length: cols }).map((_, c) => (
                  <td key={c} className="border border-border p-0 align-top">
                    {r === 0 ? (
                      <input
                        value={row[c] ?? ''}
                        onChange={(e) => setCell(r, c, e.target.value)}
                        className="bg-transparent px-3 py-2 min-w-[120px] outline-none focus:bg-secondary/40 font-mono text-xs uppercase tracking-wider"
                      />
                    ) : (
                      <textarea
                        value={row[c] ?? ''}
                        onChange={(e) => setCell(r, c, e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 min-w-[200px] outline-none focus:bg-secondary/40 text-sm leading-snug resize-y bg-transparent"
                      />
                    )}
                  </td>
                ))}
                <td className="pl-1">
                  {grid.length > 1 && (
                    <button type="button" onClick={() => onChange(grid.filter((_, i) => i !== r))} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => onChange([...grid, Array(cols).fill('')])}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Row
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => onChange(grid.map((r) => [...r, '']))}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Column
        </Button>
      </div>
    </div>
  );
}

export default function IgcseMarkSchemeTemplates() {
  const [templates, setTemplates] = useState({});
  const [ids, setIds] = useState({});
  const [dirty, setDirty] = useState({});

  const load = useCallback(async () => {
    try {
      const list = await store.entities.IgcseMarkSchemeTemplate.list();
      const t = {};
      const idMap = {};
      list.forEach((r) => {
        if (r.rows?.length) t[r.question_type] = r.rows;
        idMap[r.question_type] = r.id;
      });
      setTemplates(t);
      setIds(idMap);
      setDirty({});
    } catch { /* entity empty */ }
  }, []);

  useEffect(() => { load(); }, [load]);

  const save = async (qt) => {
    const rows = templates[qt] || genericLevels(qt);
    if (ids[qt]) await editDb.IgcseMarkSchemeTemplate.update(ids[qt], { rows });
    else {
      const created = await editDb.IgcseMarkSchemeTemplate.create({ question_type: qt, rows });
      setIds((i) => ({ ...i, [qt]: created.id }));
    }
    setDirty((d) => ({ ...d, [qt]: false }));
    window.dispatchEvent(new Event('archive:reload'));
  };

  return (
    <section className="py-12 border-t border-dashed border-border">
      <SectionHeading
        eyebrow="Admin"
        title="Generic mark schemes"
        description="These levels pre-fill every new Paper 1 question. Edit them to set your default — you'll add question-specific knowledge when you add each question."
      />
      <div className="space-y-10 mt-8">
        {QUESTION_TYPES.map((qt) => (
          <div key={qt.value} className="border border-border rounded-sm p-6 bg-card">
            <div className="flex items-center justify-between mb-4">
              <p className="font-display text-2xl">{qt.label}</p>
              <Button size="sm" variant="outline" disabled={!dirty[qt.value]} onClick={() => save(qt.value)}>
                {dirty[qt.value] ? 'Save' : 'Saved'}
              </Button>
            </div>
            <PlainTable
              rows={templates[qt.value] || genericLevels(qt.value)}
              onChange={(rows) => { setTemplates((t) => ({ ...t, [qt.value]: rows })); setDirty((d) => ({ ...d, [qt.value]: true })); }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}