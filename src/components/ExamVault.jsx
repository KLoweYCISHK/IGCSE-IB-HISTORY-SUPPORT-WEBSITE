import React, { useCallback, useEffect, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { Button } from '@/components/ui/button';
import { Plus, Pencil } from 'lucide-react';
import SectionHeading from './SectionHeading';
import HeroForm from './HeroForm';
import ExamItemForm from './ExamItemForm';
import ExamApproachList from './exam/ExamApproachList';
import ExamMarkSchemeList from './exam/ExamMarkSchemeList';
import ExamQuestionBank from './exam/ExamQuestionBank';

const TABS = [
  { key: 'approach', label: 'How to Approach' },
  { key: 'mark_scheme', label: 'Mark Schemes' },
  { key: 'question', label: 'Question Bank' },
];

export default function ExamVault({ section, caseStudy, module, title = 'The Exam Vault', description }) {
  const { editMode } = useAdmin();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [tab, setTab] = useState('approach');
  const [meta, setMeta] = useState(null);
  const [editingMeta, setEditingMeta] = useState(false);

  const metaPage = `${section}_vault`;

  const load = useCallback(async () => {
    const query = { section };
    if (caseStudy) query.case_study = caseStudy;
    setItems(await store.entities.ExamItem.filter(query, 'order'));
  }, [section, caseStudy]);

  const loadMeta = useCallback(async () => {
    const list = await store.entities.PageMeta.filter({ page: metaPage });
    setMeta(list[0] || null);
  }, [metaPage]);

  useEffect(() => {
    load();
    loadMeta();
    const handler = () => { load(); loadMeta(); };
    window.addEventListener('archive:reload', handler);
    return () => window.removeEventListener('archive:reload', handler);
  }, [load, loadMeta]);

  const saveMeta = async (draft) => {
    if (meta?.id) await editDb.PageMeta.update(meta.id, draft);
    else await editDb.PageMeta.create({ page: metaPage, ...draft });
    setEditingMeta(false);
    loadMeta();
  };

  const save = async (draft) => {
    const { id, ...data } = draft;
    if (id) await editDb.ExamItem.update(id, data);
    else await editDb.ExamItem.create({ ...data, section, case_study: caseStudy || 'all', category: data.category || 'question', order: items.length });
    setEditing(null);
    load();
  };

  const del = async (id) => { await editDb.ExamItem.delete(id); load(); };
  const byCat = (c) => items.filter((i) => {
    if ((i.category || 'question') !== c) return false;
    if (c === 'question' && module) {
      return i.module === module;
    }
    return true;
  });

  const eEyebrow = meta?.eyebrow ?? 'Examination';
  const eTitle = meta?.title ?? title;
  const eDescription = meta?.description ?? (description || 'How to approach each question, mark schemes, and a bank of practice questions.');

  return (
    <section className="py-16 md:py-24 border-t border-border">
      <SectionHeading
        eyebrow={eEyebrow}
        title={eTitle}
        description={eDescription}
        right={editMode ? (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setEditingMeta(true)}>
              <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit heading
            </Button>
            <Button variant="outline" onClick={() => setEditing({ category: tab, ...(module && tab === 'question' ? { module } : {}) })}>
              <Plus className="w-4 h-4 mr-1.5" /> Add {TABS.find((t) => t.key === tab)?.label.toLowerCase().replace('the ', '')}
            </Button>
          </div>
        ) : null}
      />

      <div className="inline-flex flex-wrap border border-border rounded-sm overflow-hidden mb-10">
        {TABS.map((t, i) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${i === TABS.length - 1 ? '' : 'border-r border-border'} ${tab === t.key ? 'bg-[#6F551A] text-[#F4EFE3]' : 'text-foreground/60 hover:bg-black/[0.04]'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'approach' && <ExamApproachList items={byCat('approach')} editMode={editMode} onEdit={setEditing} onDelete={del} />}
      {tab === 'mark_scheme' && <ExamMarkSchemeList items={byCat('mark_scheme')} editMode={editMode} onEdit={setEditing} onDelete={del} />}
      {tab === 'question' && <ExamQuestionBank items={byCat('question')} section={section} editMode={editMode} onEdit={setEditing} onDelete={del} />}

      <ExamItemForm open={!!editing} onOpenChange={(o) => !o && setEditing(null)} initial={editing} onSave={save} section={section} module={module} />
      <HeroForm
        open={editingMeta}
        onOpenChange={setEditingMeta}
        initial={{ eyebrow: eEyebrow, title: eTitle, description: eDescription }}
        onSave={saveMeta}
      />
    </section>
  );
}