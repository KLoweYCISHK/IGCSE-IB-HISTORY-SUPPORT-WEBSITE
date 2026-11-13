import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import CellEditor from './CellEditor';

const MAX_ROWS = 60;
const MAX_COLS = 8;
const clamp = (n, min, max) => Math.min(max, Math.max(min, Math.round(Number(n)) || min));

let nextId = 0;
const newIds = (n) => Array.from({ length: n }, () => `k${nextId++}`);

// A table of any size: set the number of rows and columns, or add and delete them one at a time, anywhere.
export default function TableEditor({ rows, onChange }) {
  const source = rows?.length ? rows : [['Column A', 'Column B'], ['', '']];
  const cols = Math.max(1, ...source.map((r) => r.length));
  // every row the same length, so columns can be added and removed cleanly
  const grid = source.map((r) => Array.from({ length: cols }, (_, c) => r[c] ?? ''));

  // Each row and column keeps its own key, so a cell's editor stays with its content when rows or columns
  // around it are added or deleted. latest holds the newest table, so a change is never built on an old copy.
  const latest = useRef(grid);
  latest.current = grid;
  const keys = useRef({ rows: [], cols: [] });
  if (keys.current.rows.length !== grid.length || keys.current.cols.length !== cols) {
    keys.current = { rows: newIds(grid.length), cols: newIds(cols) };
  }
  const [size, setSize] = useState({ rows: grid.length, cols });
  useEffect(() => { setSize({ rows: grid.length, cols }); }, [grid.length, cols]);

  const commit = (next, rowKeys = keys.current.rows, colKeys = keys.current.cols) => {
    keys.current = { rows: rowKeys, cols: colKeys };
    latest.current = next;
    onChange(next);
  };
  const insert = (list, at, item) => [...list.slice(0, at), item, ...list.slice(at)];
  const without = (list, at) => list.filter((_, i) => i !== at);

  const setCell = (rowKey, colKey, v) => {
    const r = keys.current.rows.indexOf(rowKey);
    const c = keys.current.cols.indexOf(colKey);
    if (r < 0 || c < 0) return; // the cell has just been deleted
    const next = latest.current.map((row) => [...row]);
    next[r][c] = v;
    commit(next);
  };
  const addRow = (at) => commit(insert(latest.current, at, Array(cols).fill('')), insert(keys.current.rows, at, newIds(1)[0]));
  const addColumn = (at) => commit(latest.current.map((r) => insert(r, at, '')), undefined, insert(keys.current.cols, at, newIds(1)[0]));
  const removeRow = (r) => commit(without(latest.current, r), without(keys.current.rows, r));
  const removeColumn = (c) => commit(latest.current.map((r) => without(r, c)), undefined, without(keys.current.cols, c));
  // setting a size keeps what is already there and adds or trims at the end
  const resize = () => {
    const nextRows = clamp(size.rows, 1, MAX_ROWS);
    const nextCols = clamp(size.cols, 1, MAX_COLS);
    const pad = (list, n) => [...list.slice(0, n), ...newIds(Math.max(0, n - list.length))];
    commit(
      Array.from({ length: nextRows }, (_, r) => Array.from({ length: nextCols }, (_, c) => latest.current[r]?.[c] ?? '')),
      pad(keys.current.rows, nextRows),
      pad(keys.current.cols, nextCols),
    );
  };
  const sizeChanged = clamp(size.rows, 1, MAX_ROWS) !== grid.length || clamp(size.cols, 1, MAX_COLS) !== cols;
  const onSizeKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); resize(); } };

  const sizeInput = 'w-16 rounded border border-border bg-background px-2 py-1 text-sm';
  const iconButton = 'p-1 text-muted-foreground disabled:opacity-30';

  return (
    <div className="space-y-3">
      <p className="chrono-eyebrow">Table — first row is the header (body cells support bullets)</p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
        <label className="flex items-center gap-2 font-medium">
          Rows
          <input type="number" min={1} max={MAX_ROWS} value={size.rows} onChange={(e) => setSize((z) => ({ ...z, rows: e.target.value }))} onKeyDown={onSizeKey} className={sizeInput} />
        </label>
        <label className="flex items-center gap-2 font-medium">
          Columns
          <input type="number" min={1} max={MAX_COLS} value={size.cols} onChange={(e) => setSize((z) => ({ ...z, cols: e.target.value }))} onKeyDown={onSizeKey} className={sizeInput} />
        </label>
        <Button type="button" size="sm" variant="outline" disabled={!sizeChanged} onClick={resize}>Set size</Button>
        <span className="text-xs text-muted-foreground">The header counts as a row. A smaller size removes rows and columns from the end.</span>
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse">
          <thead>
            <tr>
              {keys.current.cols.map((colKey, c) => (
                <td key={colKey} className="pb-1 text-center">
                  <button type="button" disabled={cols >= MAX_COLS} onClick={() => addColumn(c)} aria-label={`Add a column before column ${c + 1}`} title="Add a column before this one" className={`${iconButton} hover:text-[#1D4ED8]`}>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" disabled={cols <= 1} onClick={() => removeColumn(c)} aria-label={`Delete column ${c + 1}`} title="Delete this column" className={`${iconButton} hover:text-destructive`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              ))}
              <td />
            </tr>
          </thead>
          <tbody>
            {grid.map((row, r) => (
              <tr key={keys.current.rows[r]}>
                {row.map((cell, c) => (
                  <td key={keys.current.cols[c]} className="border border-border p-0 align-top">
                    {r === 0 ? (
                      <input
                        value={cell}
                        onChange={(e) => setCell(keys.current.rows[r], keys.current.cols[c], e.target.value)}
                        className="bg-transparent px-3 py-2 min-w-[160px] w-full outline-none focus:bg-secondary/40 font-mono text-xs uppercase tracking-wider"
                      />
                    ) : (
                      <CellEditor value={cell} onChange={(v) => setCell(keys.current.rows[r], keys.current.cols[c], v)} />
                    )}
                  </td>
                ))}
                <td className="pl-1 align-top whitespace-nowrap">
                  <button type="button" disabled={grid.length >= MAX_ROWS} onClick={() => addRow(r + 1)} aria-label={`Add a row below row ${r + 1}`} title="Add a row below this one" className={`${iconButton} hover:text-[#1D4ED8]`}>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" disabled={grid.length <= 1} onClick={() => removeRow(r)} aria-label={`Delete row ${r + 1}`} title="Delete this row" className={`${iconButton} hover:text-destructive`}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" disabled={grid.length >= MAX_ROWS} onClick={() => addRow(grid.length)}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Row
        </Button>
        <Button type="button" size="sm" variant="outline" disabled={cols >= MAX_COLS} onClick={() => addColumn(cols)}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Column
        </Button>
      </div>
    </div>
  );
}
