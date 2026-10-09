import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import CellEditor from './CellEditor';

export default function TableEditor({ rows, onChange }) {
  const grid = rows?.length ? rows : [['Column A', 'Column B'], ['', '']];
  const cols = Math.max(...grid.map((r) => r.length));

  const setCell = (r, c, v) => {
    const next = grid.map((row) => [...row]);
    next[r][c] = v;
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <p className="chrono-eyebrow">Table — first row is the header (body cells support bullets)</p>
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
                        className="bg-transparent px-3 py-2 min-w-[160px] outline-none focus:bg-secondary/40 font-mono text-xs uppercase tracking-wider"
                      />
                    ) : (
                      <CellEditor value={row[c] ?? ''} onChange={(v) => setCell(r, c, v)} />
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
        {cols > 1 && (
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange(grid.map((r) => r.slice(0, -1)))}>
            Remove column
          </Button>
        )}
      </div>
    </div>
  );
}