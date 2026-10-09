import React, { useEffect, useRef, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { ensureCardsRegistered, CARD_SNIPPETS, insertCard, readCard, replaceCard } from './quillCards';
import { LayoutGrid, ChevronDown, Pencil } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

ensureCardsRegistered();

const modules = {
  toolbar: {
    container: [
      [{ header: [1, 2, 3, false] }],
      [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline'],
      [{ color: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      ['blockquote', 'link'],
      ['table'],
      ['clean'],
    ],
    handlers: {
      table() {
        const table = this.quill.getModule('table');
        if (table) table.insertTable(4, 2);
      },
    },
  },
  clipboard: {
    matchVisual: false,
  },
  table: true,
};

const TABLE_ICON =
  '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="1.5"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/></svg>';

export default function RichTextEditor({ value, onChange, placeholder, cards = true }) {
  const quillRef = useRef(null);
  const wrapperRef = useRef(null);
  const [cardsOpen, setCardsOpen] = useState(false);
  const [editingCard, setEditingCard] = useState(null); // { variant, inner, node }

  useEffect(() => {
    const quill = quillRef.current?.getEditor?.();
    if (!quill) return;

    const btn = wrapperRef.current?.querySelector('.ql-table');
    if (btn && !btn.querySelector('svg')) btn.innerHTML = TABLE_ICON;

    quill.clipboard.addMatcher(Node.ELEMENT_NODE, (node, delta) => {
      delta.ops = delta.ops.map((op) => {
        if (op.attributes) {
          delete op.attributes.background;
        }
        if (typeof op.insert === 'string') {
          op.insert = op.insert.replace(/\u00A0/g, ' ');
        }
        return op;
      });
      return delta;
    });

    // double-click a card embed to edit its content
    const onDblClick = (e) => {
      const card = readCard(e.target);
      if (card) setEditingCard(card);
    };
    quill.root.addEventListener('dblclick', onDblClick);
    return () => quill.root.removeEventListener('dblclick', onDblClick);
  }, []);

  const handleInsertCard = (snippet) => {
    const quill = quillRef.current?.getEditor?.();
    insertCard(quill, snippet);
    setCardsOpen(false);
    quill?.focus();
  };

  const saveCardEdit = (newInner) => {
    const quill = quillRef.current?.getEditor?.();
    if (editingCard) {
      replaceCard(quill, editingCard.node, { variant: editingCard.variant, inner: newInner });
    }
    setEditingCard(null);
  };

  return (
    <div ref={wrapperRef} className="relative">
      {cards && (
        <div className="flex items-center gap-2 border-b border-border bg-secondary/40 px-2 py-1.5">
          <div className="relative">
            <button
              type="button"
              onClick={() => setCardsOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium hover:bg-background"
            >
              <LayoutGrid className="w-3.5 h-3.5" /> Insert card
              <ChevronDown className="w-3 h-3" />
            </button>
            {cardsOpen && (
              <div className="absolute left-0 top-full z-20 mt-1 w-56 rounded-md border border-border bg-popover p-1 shadow-lg">
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
        </div>
      )}
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