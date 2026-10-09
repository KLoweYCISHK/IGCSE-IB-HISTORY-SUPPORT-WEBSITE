import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';

export const makeDroppableId = (section, sub, caseStudy, module) =>
  `${section}__${sub || ''}__${caseStudy || 'all'}__${module || 'all'}`;

export const parseDroppableId = (id) => {
  const [section, sub, caseStudy, module] = (id || '').split('__');
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
  editDb.ContentBlock.bulkUpdate(list.map((b, i) => ({ id: b.id, order: i })));

// Handles both within-section reorder and cross-section block moves.
// droppableId encodes section/sub/caseStudy/module; draggableId is the block id.
export const handleBlockDragEnd = async (result) => {
  const { source, destination, draggableId } = result;
  if (!destination || !draggableId) return;
  if (source.droppableId === destination.droppableId && source.index === destination.index) return;

  const src = parseDroppableId(source.droppableId);
  const dst = parseDroppableId(destination.droppableId);

  if (source.droppableId === destination.droppableId) {
    const list = await loadOrdered(src);
    const [moved] = list.splice(source.index, 1);
    if (!moved) return;
    list.splice(destination.index, 0, moved);
    await reindex(list);
  } else {
    // Reassign the block to the destination section/sub/case/module, then fix ordering on both sides.
    await editDb.ContentBlock.update(draggableId, {
      section: dst.section,
      sub: dst.sub,
      case_study: dst.caseStudy || 'all',
      module: dst.module || 'all',
    });
    const dList = (await loadOrdered(dst)).filter((b) => b.id !== draggableId);
    dList.splice(destination.index, 0, { id: draggableId });
    await reindex(dList);
    await reindex(await loadOrdered(src));
  }

  window.dispatchEvent(new Event('archive:reload'));
};