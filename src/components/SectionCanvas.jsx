import React, { useCallback, useEffect, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown, RotateCw, ChevronDown } from 'lucide-react';
import SectionHeading from './SectionHeading';
import BlockCanvas from './BlockCanvas';
import SectionForm from './editor/SectionForm';
import { KeyTermScope, ManageKeyTermsButton, unitScope } from '@/lib/glossary';

// sectionAction renders next to each heading (e.g. a "revised" tick); empty shows when there are no sections.
// compact draws smaller, card-style subsections (used for revision notes inside a focus unit).
// scopeSlugs keeps two units' subsections apart when they share a title such as "Key terms".
// keyTerms switches key words on; they belong to this unit (page + module). keyTermsLabel is the unit's name, shown to the teacher.
// collapsible (with compact) gives each subsection a "Show notes" drop-down; closed for students until they open it, open while editing.
export default function SectionCanvas({ page, caseStudy, module, className = '', filterFn, sectionAction, empty, tableFlashcards, keyTerms = false, keyTermsLabel, compact = false, addLabel = 'Add section', scopeSlugs = false, collapsible = false, onChange }) {
  const { editMode } = useAdmin();
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [shown, setShown] = useState({});

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await store.entities.PageSection.filter({ page }, 'order');
      const visible = (module
        ? list.filter((s) => !s.is_deleted && s.module === module)
        : list.filter((s) => !s.is_deleted)
      ).filter((s) => (filterFn ? filterFn(s) : true));
      setSections(visible);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [page, module]);

  useEffect(() => {
    setLoading(true); load();
    const handler = () => load();
    window.addEventListener('archive:reload', handler);
    return () => window.removeEventListener('archive:reload', handler);
  }, [load]);

  const save = async (draft) => {
    const { id, ...data } = draft;
    if (id) await editDb.PageSection.update(id, data);
    else {
      const slug = scopeSlugs && module ? `${module}__${data.slug}` : data.slug;
      await editDb.PageSection.create({ ...data, slug, page, module: data.module || module || 'all', order: sections.length });
    }
    setEditing(null);
    await load();
    onChange?.();
  };

  const move = async (index, dir) => {
    const target = sections[index + dir];
    if (!target) return;
    const current = sections[index];
    await editDb.PageSection.bulkUpdate([
      { id: current.id, order: index + dir },
      { id: target.id, order: index },
    ]);
    load();
  };

  const remove = async (s) => {
    await editDb.ContentBlock.updateMany({ section: page, sub: s.slug }, { $set: { is_deleted: true } });
    await editDb.PageSection.update(s.id, { is_deleted: true });
    await load();
    onChange?.();
  };

  if (loading) return <div className={`${compact ? 'h-12' : 'h-24'} animate-pulse bg-black/[0.04] rounded`} />;

  if (error) {
    return (
      <div className="py-12 border-t border-border text-center">
        <p className="text-foreground/60 mb-4">Couldn't load this section — please check your connection.</p>
        <Button variant="outline" size="sm" onClick={load}>
          <RotateCw className="w-3.5 h-3.5 mr-1.5" /> Retry
        </Button>
      </div>
    );
  }

  return (
    <KeyTermScope on={keyTerms} scope={unitScope(page, module)} label={keyTermsLabel}>
    <div className={className}>
      {sections.map((s, i) => {
        const canFold = compact && collapsible;
        const isShown = !canFold || (shown[s.id] ?? editMode);
        return (
        <section key={s.id} className={compact ? 'relative group rounded-sm border border-border bg-background p-5 md:p-6 mb-4' : 'relative group py-16 md:py-20 border-t border-border'}>
          {editMode && (
            <div className="absolute -top-3 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-card border border-border rounded px-1 py-1">
              <button onClick={() => move(i, -1)} className="p-1.5 hover:text-[#1D4ED8]"><ArrowUp className="w-4 h-4" /></button>
              <button onClick={() => move(i, 1)} className="p-1.5 hover:text-[#1D4ED8]"><ArrowDown className="w-4 h-4" /></button>
              <button onClick={() => setEditing(s)} className="p-1.5 hover:text-[#1D4ED8]"><Pencil className="w-4 h-4" /></button>
              <button onClick={() => remove(s)} className="p-1.5 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
            </div>
          )}
          {compact ? (
            <div className={`flex flex-wrap items-center justify-between gap-3 ${isShown ? 'mb-4' : ''}`}>
              <div>
                {s.eyebrow && <p className="chrono-eyebrow mb-1">{s.eyebrow}</p>}
                <h4 className="font-display text-xl md:text-2xl leading-tight">{s.title}</h4>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {canFold && (
                  <button
                    onClick={() => setShown((o) => ({ ...o, [s.id]: !isShown }))}
                    aria-expanded={isShown}
                    aria-controls={`notes-${s.id}`}
                    className="inline-flex items-center gap-2 rounded-full min-h-[40px] px-4 text-sm font-bold border-2 border-border hover:border-[#1D4ED8] transition-colors"
                  >
                    {isShown ? 'Hide notes' : 'Show notes'}
                    <ChevronDown className={`w-4 h-4 transition-transform ${isShown ? 'rotate-180' : ''}`} />
                  </button>
                )}
                {sectionAction ? sectionAction(s) : null}
              </div>
            </div>
          ) : (
            <SectionHeading eyebrow={s.eyebrow} title={s.title} right={sectionAction ? sectionAction(s) : undefined} />
          )}
          {isShown && (
            <div id={`notes-${s.id}`}>
              <BlockCanvas section={page} sub={s.slug} caseStudy={caseStudy} module={module} emptyLabel="No content here yet." tableFlashcards={tableFlashcards} />
            </div>
          )}
        </section>
        );
      })}

      {sections.length === 0 && empty}

      {editMode && (
        <div className={`flex flex-wrap gap-2 ${compact ? 'pt-2' : 'py-10 border-t border-dashed border-border'}`}>
          <Button variant="outline" size="sm" onClick={() => setEditing({})}>
            <Plus className="w-3.5 h-3.5 mr-1.5" /> {addLabel}
          </Button>
          {keyTerms && <ManageKeyTermsButton />}
        </div>
      )}

      <SectionForm open={!!editing} onOpenChange={(o) => !o && setEditing(null)} initial={editing} onSave={save} page={page} module={module} />
    </div>
    </KeyTermScope>
  );
}