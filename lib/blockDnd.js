import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';

// A drop zone's id carries section/sub/caseStudy/module. It is JSON because a section's
// slug can itself contain "__" (revision subsections are stored as "<unit>__<slug>").
export const makeDroppableId = (section, sub, caseStudy, module) =>
  JSON.stringify([section, sub || '', caseStudy || 'all', module || 'all']);

export const parseDroppableId = (id) => {
  let parts;
  try { parts = JSON.parse(id); } catch { parts = null; }
  const [section, sub, caseStudy, module] = Array.isArray(parts) ? parts : [];
  return {
    section,
    sub,
    caseStudy: caseStudy === 'all' ? undefined : caseStudy,
    module: module === 'all' ? undefined : module,
  };
};

const loadOrdered = async ({ section, sub, caseStudy, module }) => {
  const query = { section, sub };
  if (caseStudy) query.case_study = caseStudy;
  const list = await store.entities.ContentBlock.filter(query, 'order');
  const visible = module
    ? list.filter((b) => !b.is_deleted && b.module === module)
    : list.filter((b) => !b.is_deleted);
  return visible;
};

const reindex = (list) =>
  (list.length ? editDb.ContentBlock.bulkUpdate(list.map((b, i) => ({ id: b.id, order: i }))) : null);

// Puts a block into dst = { section, sub, caseStudy, module } at `index` (past the end = last),
// then tidies the order of the place it came from.
const relocate = async (blockId, src, dst, index) => {
  await editDb.ContentBlock.update(blockId, {
    section: dst.section,
    sub: dst.sub,
    case_study: dst.caseStudy || 'all',
    module: dst.module || 'all',
  });
  const dList = (await loadOrdered(dst)).filter((b) => b.id !== blockId);
  dList.splice(Math.min(index, dList.length), 0, { id: blockId });
  await reindex(dList);
  if (src) await reindex((await loadOrdered(src)).filter((b) => b.id !== blockId));
};

// Handles both within-section reorder and cross-section block moves.
export const handleBlockDragEnd = async (result) => {
  const { source, destination, draggableId } = result;
  if (!destination || !draggableId) return;
  if (source.droppableId === destination.droppableId && source.index === destination.index) return;

  const src = parseDroppableId(source.droppableId);
  const dst = parseDroppableId(destination.droppableId);
  if (!src.section || !dst.section) return;

  if (source.droppableId === destination.droppableId) {
    const list = await loadOrdered(src);
    const [moved] = list.splice(source.index, 1);
    if (!moved) return;
    list.splice(destination.index, 0, moved);
    await reindex(list);
  } else {
    await relocate(draggableId, src, dst, destination.index);
  }

  window.dispatchEvent(new Event('archive:reload'));
};

// "Move to…" picker: sends a block to any section on the site, open or closed.
// target = a PageSection record; place = 'top' | 'bottom'.
export const moveBlockToSection = async (block, target, place = 'bottom') => {
  const src = {
    section: block.section,
    sub: block.sub,
    module: block.module && block.module !== 'all' ? block.module : undefined,
  };
  const dst = {
    section: target.page,
    sub: target.slug,
    module: target.module && target.module !== 'all' ? target.module : undefined,
  };
  await relocate(block.id, src, dst, place === 'top' ? 0 : Number.MAX_SAFE_INTEGER);
  window.dispatchEvent(new Event('archive:reload'));
};
