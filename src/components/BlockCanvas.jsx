import React, { useCallback, useEffect, useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { Button } from '@/components/ui/button';
import ResizableImage from './ResizableImage';
import { Plus, Type, Table2, ImageIcon, Link2, FileDown } from 'lucide-react';
import ArchiveTable from './ArchiveTable';
import LinkPill from './LinkPill';
import BlockToolbar from './BlockToolbar';
import BlockForm from './editor/BlockForm';
import { makeDroppableId } from '@/lib/blockDnd';
import { stripPasteArtifacts } from '@/lib/sanitizeHtml';

function ImageBlock({ b }) {
  const layout = b.image_layout || 'full';
  const hasText = !!b.html && b.html.replace(/<[^>]*>/g, '').trim().length > 0;
  const widthPct = b.image_width ?? 100;

  const figure = (w) => (
    <ResizableImage src={b.image_url} alt={b.caption || b.title || ''} caption={b.caption} widthPct={w} />
  );

  if (layout === 'top' && hasText) {
    return (
      <div className="space-y-8 md:space-y-10">
        {figure(widthPct)}
        <div className="prose-archive min-w-0" dangerouslySetInnerHTML={{ __html: stripPasteArtifacts(b.html) }} />
      </div>
    );
  }

  if (layout === 'full' || !hasText) {
    return figure(widthPct);
  }

  const textEl = <div className="prose-archive min-w-0" dangerouslySetInnerHTML={{ __html: stripPasteArtifacts(b.html) }} />;

  return (
    <div className={`grid gap-8 md:gap-10 items-start overflow-hidden ${layout === 'left' ? 'md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]' : 'md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]'}`}>
      {layout === 'left' ? (
        <>
          {figure(100)}
          {textEl}
        </>
      ) : (
        <>
          {textEl}
          {figure(100)}
        </>
      )}
    </div>
  );
}

export default function BlockCanvas({ section, sub, caseStudy, module, emptyLabel = 'Nothing here yet.' }) {
  const { editMode } = useAdmin();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    const query = { section, sub };
    if (caseStudy) query.case_study = caseStudy;
    const list = await store.entities.ContentBlock.filter(query, 'order');
    const visible = module
      ? list.filter((b) => !b.is_deleted && b.module === module)
      : list.filter((b) => !b.is_deleted);
    setBlocks(visible);
    setLoading(false);
  }, [section, sub, caseStudy, module]);

  useEffect(() => {
    setLoading(true); load();
    const handler = () => load();
    window.addEventListener('archive:reload', handler);
    return () => window.removeEventListener('archive:reload', handler);
  }, [load]);

  const save = async (draft) => {
    const { id, ...data } = draft;
    if (id) await editDb.ContentBlock.update(id, data);
    else await editDb.ContentBlock.create({ ...data, section, sub, case_study: caseStudy || 'all', module: module || 'all', order: blocks.length });
    setEditing(null);
    load();
  };

  const remove = async (id) => {
    await editDb.ContentBlock.update(id, { is_deleted: true });
    load();
  };

  if (loading) return <div className="h-24 animate-pulse bg-black/[0.04] rounded" />;

  const droppableId = makeDroppableId(section, sub, caseStudy, module);

  // Group consecutive link blocks into compact flow clusters
  const groups = [];
  blocks.forEach((b, i) => {
    const isLink = b.kind === 'link' && b.link_url;
    const last = groups[groups.length - 1];
    if (isLink && last && last.type === 'links') last.items.push({ b, i });
    else if (isLink) groups.push({ type: 'links', items: [{ b, i }] });
    else groups.push({ type: 'single', b, i });
  });

  return (
    <Droppable droppableId={droppableId} isDropDisabled={!editMode}>
      {(provided) => (
        <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-10">
          {blocks.length === 0 && !editMode && (
            <p className="text-foreground/40 italic">{emptyLabel}</p>
          )}

          {groups.map((g) => {
            if (g.type === 'links') {
              return (
                <div key={`links-${g.items[0].i}`} className="flex flex-wrap gap-3 items-start">
                  {g.items.map(({ b, i }) => (
                    <Draggable key={b.id} draggableId={b.id} index={i} isDragDisabled={!editMode}>
                      {(prov) => (
                        <div ref={prov.innerRef} {...prov.draggableProps} className="relative group">
                          {editMode && <BlockToolbar dragHandleProps={prov.dragHandleProps} onEdit={() => setEditing(b)} onRemove={() => remove(b.id)} />}
                          <LinkPill b={b} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                </div>
              );
            }
            const { b, i } = g;
            return (
              <Draggable key={b.id} draggableId={b.id} index={i} isDragDisabled={!editMode}>
                {(prov) => (
                  <article ref={prov.innerRef} {...prov.draggableProps} className="relative group">
                    {editMode && <BlockToolbar dragHandleProps={prov.dragHandleProps} onEdit={() => setEditing(b)} onRemove={() => remove(b.id)} />}

                    {b.title && b.kind !== 'link' && b.kind !== 'file' && <h3 className="font-display text-2xl md:text-3xl mb-4">{b.title}</h3>}

                    {b.kind === 'table' && <ArchiveTable rows={b.rows} />}

                    {b.kind === 'image' && b.image_url && <ImageBlock b={b} />}

                    {b.kind === 'file' && b.file_url && (
                      <div className="space-y-2">
                        <a
                          href={b.file_url}
                          target="_blank"
                          rel="noreferrer"
                          download={b.file_name || undefined}
                          className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/10 hover:border-accent/40"
                        >
                          <FileDown className="w-4 h-4 text-muted-foreground" />
                          {b.title || b.file_name || 'Download document'}
                        </a>
                        {b.caption && <p className="text-foreground/70 text-sm">{b.caption}</p>}
                      </div>
                    )}

                    {(!b.kind || b.kind === 'text') && (
                      <div className="prose-archive" dangerouslySetInnerHTML={{ __html: stripPasteArtifacts(b.html || '') }} />
                    )}
                  </article>
                )}
              </Draggable>
            );
          })}

          {provided.placeholder}

          {editMode && (
            <div className="flex flex-wrap gap-2 pt-2 border-t border-dashed border-border">
              <Button variant="outline" size="sm" onClick={() => setEditing({ kind: 'text' })}>
                <Type className="w-3.5 h-3.5 mr-1.5" /> Text
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing({ kind: 'table', rows: [['Column A', 'Column B'], ['', '']] })}>
                <Table2 className="w-3.5 h-3.5 mr-1.5" /> Table
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing({ kind: 'image', image_layout: 'full' })}>
                <ImageIcon className="w-3.5 h-3.5 mr-1.5" /> Image
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing({ kind: 'link' })}>
                <Link2 className="w-3.5 h-3.5 mr-1.5" /> Link
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing({ kind: 'file' })}>
                <FileDown className="w-3.5 h-3.5 mr-1.5" /> File
              </Button>
              <span className="chrono-eyebrow self-center ml-2 flex items-center gap-1"><Plus className="w-3 h-3" /> add a block · drag the handle to place it</span>
            </div>
          )}

          <BlockForm open={!!editing} onOpenChange={(o) => !o && setEditing(null)} initial={editing} onSave={save} />
        </div>
      )}
    </Droppable>
  );
}