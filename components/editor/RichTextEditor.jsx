import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { ensureCardsRegistered, CARD_SNIPPETS, insertCard, readCard, replaceCard } from './quillCards';
import { ensureImageRegistered, insertImage, formatImage, removeImage } from './quillImage';
import { currentTable, insertTable, tableAction } from './quillTables';
import { uploadFile } from '@/api/editor';
import { LayoutGrid, ChevronDown, Pencil, Table2, ImagePlus, Loader2, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

ensureCardsRegistered();
ensureImageRegistered();

// Uploads each picture, then places it where the cursor is.
async function uploadImages(quill, files, index) {
  let at = index;
  for (const file of files) {
    if (!file.type?.startsWith('image/')) continue;
    const { file_url } = await uploadFile({ file });
    insertImage(quill, file_url, at);
    if (typeof at === 'number') at += 1;
  }
}

const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline'],
      [{ color: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'link'],
      ['clean'],
    ],
  },
  clipboard: {
    matchVisual: false,
  },
  table: true,
  // pictures pasted or dragged into the notes are uploaded, not stored inside the text
  uploader: {
    handler(range, files) {
      uploadImages(this.quill, files, range.index).catch(() => {});
    },
  },
};

const barButton = 'inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium hover:bg-background disabled:opacity-50';
const clamp = (n, min, max) => Math.min(max, Math.max(min, Math.round(Number(n) || min)));

const TABLE_ACTIONS = [
  ['insertRowAbove', 'Row above'],
  ['insertRowBelow', 'Row below'],
  ['insertColumnLeft', 'Column left'],
  ['insertColumnRight', 'Column right'],
];
const TABLE_REMOVALS = [
  ['deleteRow', 'Delete row'],
  ['deleteColumn', 'Delete column'],
  ['deleteTable', 'Delete table'],
];

const PLACEMENTS = [
  ['', 'In line'],
  ['left', 'Left'],
  ['center', 'Centre'],
  ['right', 'Right'],
];

// Shown over a clicked picture: drag the corner or the slider to resize it, choose where it sits, or delete it.
function ImageControls({ quill, node, wrapper, onClose }) {
  const [box, setBox] = useState(null);
  const [, redraw] = useState(0);

  // keep the outline on the picture as it is resized or the notes around it move
  useLayoutEffect(() => {
    if (!node.isConnected) { onClose(); return; }
    const a = node.getBoundingClientRect();
    const b = wrapper.getBoundingClientRect();
    const next = { left: a.left - b.left, top: a.top - b.top, width: a.width, height: a.height };
    setBox((old) => (old && Object.keys(next).every((k) => Math.abs(old[k] - next[k]) < 0.5) ? old : next));
  });

  if (!box) return null;

  const align = node.getAttribute('data-align') || '';
  const parent = node.parentElement;
  const style = getComputedStyle(parent);
  const room = parent.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const pct = clamp(parseFloat(node.getAttribute('width')) || (box.width / room) * 100, 5, 100);

  const apply = (formats) => { if (formatImage(quill, node, formats)) redraw((n) => n + 1); else onClose(); };
  const setWidth = (value) => apply({ width: `${clamp(value, 5, 100)}%`, height: false });

  const startDrag = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = box.width;
    const direction = align === 'right' ? -1 : 1; // a right-hand picture grows to the left
    const onMove = (ev) => setWidth(((startWidth + (ev.clientX - startX) * direction) / room) * 100);
    const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  };

  return (
    <>
      <div className="pointer-events-none absolute z-20 border-2 border-[#1D4ED8]" style={box}>
        <button
          type="button"
          aria-label="Drag to resize the image"
          onPointerDown={startDrag}
          className={`pointer-events-auto absolute -bottom-2 h-4 w-4 rounded-full border-2 border-white bg-[#1D4ED8] shadow touch-none ${align === 'right' ? '-left-2 cursor-nesw-resize' : '-right-2 cursor-nwse-resize'}`}
        />
      </div>
      <div
        className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-b border-border bg-[#1D4ED8]/5 px-3 py-1.5 text-xs"
        onMouseDown={(e) => { if (e.target.tagName !== 'INPUT') e.preventDefault(); }}
      >
        <span className="font-bold">Image</span>
        <label className="flex items-center gap-2 font-medium">
          Size
          <input type="range" min={5} max={100} step={1} value={pct} onChange={(e) => setWidth(e.target.value)} className="w-32 accent-[#1D4ED8]" />
          <span className="w-9 font-mono tabular-nums">{pct}%</span>
        </label>
        <div className="flex items-center gap-1">
          <span className="font-medium mr-1">Position</span>
          {PLACEMENTS.map(([value, label]) => (
            <button key={label} type="button" aria-pressed={align === value} onClick={() => apply({ 'data-align': value || false })}
              className={`rounded px-2 py-1 font-medium ${align === value ? 'bg-[#1D4ED8] text-white' : 'hover:bg-secondary'}`}>
              {label}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => { removeImage(quill, node); onClose(); }} className="inline-flex items-center gap-1 rounded px-2 py-1 font-medium text-destructive hover:bg-destructive/10">
          <Trash2 className="w-3.5 h-3.5" /> Delete image
        </button>
        <button type="button" onClick={onClose} className="ml-auto rounded px-2 py-1 font-medium hover:bg-secondary">Done</button>
      </div>
    </>
  );
}

export default function RichTextEditor({ value, onChange, placeholder, cards = true }) {
  const quillRef = useRef(null);
  const wrapperRef = useRef(null);
  const fileRef = useRef(null);
  const lastRange = useRef(null); // where the cursor last was, so the buttons above the notes know where to act
  const [cardsOpen, setCardsOpen] = useState(false);
  const [tableOpen, setTableOpen] = useState(false);
  const [size, setSize] = useState({ rows: 3, columns: 2 });
  const [inTable, setInTable] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [image, setImage] = useState(null); // the picture being resized
  const [, setVersion] = useState(0); // bumped to redraw the picture outline when the notes change
  const [editingCard, setEditingCard] = useState(null); // { variant, inner, node }

  const getQuill = () => quillRef.current?.getEditor?.();
  const closeImage = useCallback(() => setImage(null), []);

  useEffect(() => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return undefined;

    quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
      delta.ops = delta.ops.map((op) => {
        if (op.attributes) {
          delete op.attributes.background;
        }
        if (typeof op.insert === 'string') {
          op.insert = op.insert.replace(/ /g, ' ');
        }
        return op;
      });
      return delta;
    });

    const track = (range) => {
      if (range) { lastRange.current = range; setInTable(!!currentTable(quill, range)); }
    };
    const onSelection = (range) => track(range);
    const onText = () => { track(quill.getSelection()); setVersion((n) => n + 1); };
    quill.on('selection-change', onSelection);
    quill.on('text-change', onText);

    // click a picture to resize or move it; double-click a card embed to edit its content
    const onClick = (e) => {
      const img = e.target.tagName === 'IMG' && !e.target.closest('.arc-card') ? e.target : null;
      setImage(img);
    };
    const onDblClick = (e) => {
      const card = readCard(e.target);
      if (card) setEditingCard(card);
    };
    const onLoad = (e) => { if (e.target.tagName === 'IMG') setVersion((n) => n + 1); };
    const onResize = () => setVersion((n) => n + 1);
    quill.root.addEventListener('click', onClick);
    quill.root.addEventListener('dblclick', onDblClick);
    quill.root.addEventListener('load', onLoad, true);
    window.addEventListener('resize', onResize);
    return () => {
      quill.off('selection-change', onSelection);
      quill.off('text-change', onText);
      quill.root.removeEventListener('click', onClick);
      quill.root.removeEventListener('dblclick', onDblClick);
      quill.root.removeEventListener('load', onLoad, true);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  // the cursor's last position, or the end of the notes if they have not been clicked yet
  const where = () => {
    const quill = getQuill();
    return lastRange.current || { index: Math.max(0, quill.getLength() - 1), length: 0 };
  };

  const handleInsertCard = (snippet) => {
    const quill = getQuill();
    insertCard(quill, snippet);
    setCardsOpen(false);
    quill?.focus();
  };

  const handleInsertTable = () => {
    const quill = getQuill();
    if (!quill) return;
    insertTable(quill, clamp(size.rows, 1, 30), clamp(size.columns, 1, 8), where());
    setTableOpen(false);
  };

  const handleTableAction = (action) => {
    const quill = getQuill();
    if (quill) tableAction(quill, action, where());
  };

  const handleFiles = async (e) => {
    const files = [...(e.target.files || [])];
    e.target.value = '';
    const quill = getQuill();
    if (!files.length || !quill) return;
    const range = where();
    setUploading(true);
    try { await uploadImages(quill, files, range.index + range.length); }
    catch { /* uploadFile has already told the teacher what went wrong */ }
    finally { setUploading(false); }
  };

  const saveCardEdit = (newInner) => {
    const quill = getQuill();
    if (editingCard) {
      replaceCard(quill, editingCard.node, { variant: editingCard.variant, inner: newInner });
    }
    setEditingCard(null);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <div className="flex flex-wrap items-center gap-1 border-b border-border bg-secondary/40 px-2 py-1.5">
        {cards && (
          <div className="relative">
            <button
              type="button"
              onClick={() => { setCardsOpen((o) => !o); setTableOpen(false); }}
              className={barButton}
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Insert card
              <ChevronDown className="w-3 h-3" />
            </button>
            {cardsOpen && (
              <div className="absolute left-0 top-full z-40 mt-1 w-56 rounded-md border border-border bg-popover p-1 shadow-lg">
                {CARD_SNIPPETS.map((s) => (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => handleInsertCard(s)}
                    className="block w-full rounded px-2 py-1.5 text-left text-sm hover:bg-secondary"
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <button type="button" onClick={() => { setTableOpen((o) => !o); setCardsOpen(false); }} aria-expanded={tableOpen} className={barButton}>
            <Table2 className="w-3.5 h-3.5" /> Insert table
            <ChevronDown className="w-3 h-3" />
          </button>
          {tableOpen && (
            <div className="absolute left-0 top-full z-40 mt-1 w-60 space-y-3 rounded-md border border-border bg-popover p-3 shadow-lg">
              <div className="grid grid-cols-2 gap-3">
                {[['rows', 'Rows', 30], ['columns', 'Columns', 8]].map(([key, label, max]) => (
                  <label key={key} className="space-y-1 text-xs font-medium">
                    {label}
                    <input
                      type="number" min={1} max={max} value={size[key]}
                      onChange={(e) => setSize((s) => ({ ...s, [key]: e.target.value }))}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleInsertTable(); } }}
                      className="block w-full rounded border border-border bg-background px-2 py-1.5 text-sm"
                    />
                  </label>
                ))}
              </div>
              <Button type="button" size="sm" className="w-full" onClick={handleInsertTable}>Insert table</Button>
              <p className="text-[11px] leading-snug text-muted-foreground">It goes in below the line your cursor is on. Click inside it afterwards to add or delete rows and columns.</p>
            </div>
          )}
        </div>

        <button type="button" disabled={uploading} onClick={() => fileRef.current?.click()} className={barButton}>
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ImagePlus className="w-3.5 h-3.5" />}
          {uploading ? 'Uploading…' : 'Insert image'}
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFiles} />
      </div>

      {inTable && (
        <div className="flex flex-wrap items-center gap-1 border-b border-border bg-[#1D4ED8]/5 px-2 py-1.5" onMouseDown={(e) => e.preventDefault()}>
          <span className="px-1 text-xs font-bold">Table</span>
          {TABLE_ACTIONS.map(([action, label]) => (
            <button key={action} type="button" onClick={() => handleTableAction(action)} className={barButton}>+ {label}</button>
          ))}
          <span className="mx-1 h-4 w-px bg-border" />
          {TABLE_REMOVALS.map(([action, label]) => (
            <button key={action} type="button" onClick={() => handleTableAction(action)} className={`${barButton} text-destructive`}>{label}</button>
          ))}
        </div>
      )}

      {image && <ImageControls quill={getQuill()} node={image} wrapper={wrapperRef.current} onClose={closeImage} />}

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder || 'Write here…'}
      />

      <Dialog open={!!editingCard} onOpenChange={(o) => !o && setEditingCard(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-4 h-4" /> Edit card content
            </DialogTitle>
          </DialogHeader>
          {editingCard && (
            <CardEditor
              initialInner={editingCard.inner}
              variant={editingCard.variant}
              onSave={saveCardEdit}
              onCancel={() => setEditingCard(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function CardEditor({ initialInner, variant, onSave, onCancel }) {
  const [inner, setInner] = useState(initialInner || '');
  return (
    <div>
      <div className="mb-3">
        <div className="arc-card" data-variant={variant}>
          <div className="prose-archive" dangerouslySetInnerHTML={{ __html: inner || '<p class="text-foreground/40">Nothing yet…</p>' }} />
        </div>
      </div>
      <RichTextEditor value={inner} onChange={setInner} cards={false} placeholder="Edit the card content…" />
      <DialogFooter className="mt-4">
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
        <Button onClick={() => onSave(inner)}>Save card</Button>
      </DialogFooter>
    </div>
  );
}