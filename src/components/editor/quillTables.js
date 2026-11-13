import { Delta } from 'quill';

// Helpers for tables typed inside rich text (Quill's table module).

// The table the cursor is in, or null.
export function currentTable(quill, range = quill?.getSelection()) {
  if (!quill || !range) return null;
  const [table] = quill.getModule('table').getTable(range);
  return table || null;
}

// A plain empty line at index, whatever the formatting of the lines around it.
const plainLine = (quill, index) => quill.updateContents(new Delta().retain(index).insert('\n'), 'user');

/**
 * Inserts a table of any size on its own line.
 * Quill would otherwise pull the paragraph the cursor is in into the first cell,
 * and merge a new table into the one the cursor is already inside.
 */
export function insertTable(quill, rows, columns, range = quill?.getSelection(true)) {
  if (!quill || !range) return;
  const inside = currentTable(quill, range);
  let index;
  if (inside) {
    // after the current table, with an empty line between the two
    index = quill.getIndex(inside) + inside.length();
    plainLine(quill, index);
    plainLine(quill, index);
    index += 1;
  } else {
    const [line] = quill.getLine(range.index);
    const start = quill.getIndex(line);
    const empty = line.length() <= 1 && !Object.keys(quill.getFormat(start, 0)).length;
    index = empty ? start : start + line.length();
    // keeps an empty line after the table, so there is somewhere to carry on typing
    plainLine(quill, index);
  }
  quill.setSelection(index, 0, 'silent');
  quill.getModule('table').insertTable(Math.max(1, rows), Math.max(1, columns));
  quill.setSelection(index, 0, 'user');
}

export function deleteTable(quill, range = quill?.getSelection(true)) {
  const table = currentTable(quill, range);
  if (!table) return;
  const index = quill.getIndex(table);
  quill.deleteText(index, table.length(), 'user');
  quill.setSelection(Math.min(index, quill.getLength() - 1), 0, 'user');
}

// One row or column at a time. A table's last row or column removes the whole table.
export function tableAction(quill, action, range = quill?.getSelection(true)) {
  if (!quill || !range) return;
  const module = quill.getModule('table');
  const [table, row] = module.getTable(range);
  if (!table) return;
  quill.setSelection(range.index, range.length, 'silent');
  if (action === 'deleteTable') { deleteTable(quill, range); return; }
  if (action === 'deleteRow' && table.rows().length <= 1) { deleteTable(quill, range); return; }
  if (action === 'deleteColumn' && row.children.length <= 1) { deleteTable(quill, range); return; }
  module[action]();
}
