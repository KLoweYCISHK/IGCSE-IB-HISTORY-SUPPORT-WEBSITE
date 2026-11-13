import React, { useCallback, useEffect, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Plus, ArrowUp, ArrowDown, ChevronDown, ChevronRight, Check, Circle } from 'lucide-react';
import { toggle, useProgress } from '@/lib/progress';
import BlockCanvas from './BlockCanvas';
import StepForm from './editor/StepForm';

const slugify = (t) => (t || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'step';

// Steps are drawn as a flow chart: an at-a-glance strip of numbered steps, then one card per step joined by arrows.
// Students open one step at a time and tick it off; ticks are saved on their own device.
export default function Roadmap({ section, stages }) {
  const { editMode } = useAdmin();
  const { revised } = useProgress();
  const [openMap, setOpenMap] = useState({});
  const [allSteps, setAllSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeStage, setActiveStage] = useState(stages[0]?.key);
  const [editing, setEditing] = useState(null);

  const load = useCallback(async () => {
    const list = await store.entities.RoadmapStep.filter({ page: section }, 'order');
    setAllSteps(list.filter((s) => !s.is_deleted));
    setLoading(false);
  }, [section]);

  useEffect(() => {
    setLoading(true); load();
    const handler = () => load();
    window.addEventListener('archive:reload', handler);
    return () => window.removeEventListener('archive:reload', handler);
  }, [load]);

  const stageSteps = allSteps.filter((s) => s.stage === activeStage);

  // progress: a step's tick is kept with the student's other ticks, under "step_<id>"
  const isDone = (s) => !!revised[`step_${s.id}`];
  const doneCount = stageSteps.filter(isDone).length;
  const firstTodo = stageSteps.find((s) => !isDone(s))?.id;
  // students start with their next step open; the teacher sees every step open for editing
  const isOpen = (s) => openMap[s.id] ?? (editMode ? true : s.id === firstTodo);
  const jump = (s) => {
    setOpenMap((o) => ({ ...o, [s.id]: true }));
    window.setTimeout(() => document.getElementById(`step-${s.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
  };
  const finish = (s, next) => {
    const wasDone = isDone(s);
    toggle('revised', `step_${s.id}`);
    if (!wasDone && next) { setOpenMap((o) => ({ ...o, [s.id]: false })); jump(next); }
  };

  const save = async (draft) => {
    const { id, ...data } = draft;
    if (id) {
      await editDb.RoadmapStep.update(id, data);
    } else {
      let slug = data.slug || slugify(data.title);
      if (allSteps.some((s) => s.slug === slug)) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
      await editDb.RoadmapStep.create({ ...data, page: section, stage: activeStage, slug, order: stageSteps.length });
    }
    setEditing(null);
    load();
  };

  const move = async (index, dir) => {
    const target = stageSteps[index + dir];
    if (!target) return;
    const current = stageSteps[index];
    await editDb.RoadmapStep.bulkUpdate([
      { id: current.id, order: index + dir },
      { id: target.id, order: index },
    ]);
    load();
  };

  const remove = async (s) => {
    await editDb.RoadmapStep.update(s.id, { is_deleted: true });
    load();
  };

  if (loading) return <div className="h-24 animate-pulse bg-black/[0.04] rounded" />;

  return (
    <div className="py-8">
      {stages.length > 1 && (
        <div className="inline-flex flex-wrap border border-border rounded-sm overflow-hidden mb-12">
          {stages.map((s, i) => (
            <button
              key={s.key}
              onClick={() => setActiveStage(s.key)}
              className={`px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.2em] transition-colors ${i === stages.length - 1 ? '' : 'border-r border-border'} ${activeStage === s.key ? 'bg-[#1D4ED8] text-white' : 'text-foreground/60 hover:bg-black/[0.04]'}`}
            >
              {s.label}
            </button>
          ))}
        </div>
      )}

      {stageSteps.length > 0 && (
        <>
          <div className="mb-8 rounded-sm bg-card border border-border p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">{doneCount} of {stageSteps.length} steps done</p>
              <p className="text-sm text-muted-foreground">Your ticks are saved on this device.</p>
            </div>
            <div className="h-2.5 rounded-full bg-border overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={stageSteps.length} aria-valuenow={doneCount} aria-label="Steps done">
              <div className="h-full bg-[#1D4ED8] transition-all" style={{ width: `${(doneCount / stageSteps.length) * 100}%` }} />
            </div>
            <nav aria-label="Steps at a glance">
              <ol className="flex flex-wrap items-center gap-x-1 gap-y-2">
                {stageSteps.map((s, i) => (
                  <li key={s.id} className="flex items-center gap-1">
                    <button onClick={() => jump(s)}
                      className={`inline-flex items-center gap-2 min-h-[40px] rounded-full border-2 pl-1.5 pr-4 text-sm font-bold text-left transition-colors ${isDone(s) ? 'border-teal-700 text-teal-900 bg-teal-50' : 'border-border hover:border-[#1D4ED8]'}`}>
                      <span className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs text-white ${isDone(s) ? 'bg-teal-700' : 'bg-[#1D4ED8]'}`}>
                        {isDone(s) ? <Check className="w-4 h-4" aria-label="Done:" /> : i + 1}
                      </span>
                      {s.title}
                    </button>
                    {i < stageSteps.length - 1 && <ChevronRight className="w-4 h-4 shrink-0 text-foreground/40" aria-hidden="true" />}
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          <ol>
            {stageSteps.map((s, i) => {
              const open = isOpen(s);
              const done = isDone(s);
              const next = stageSteps[i + 1];
              return (
                <li key={s.id} id={`step-${s.id}`} className="relative group flex gap-4 md:gap-6 scroll-mt-28">
                  {/* the rail: numbered circle, then a line and arrow down to the next step */}
                  <div className="flex flex-col items-center shrink-0" aria-hidden="true">
                    <span className={`w-11 h-11 rounded-full flex items-center justify-center font-display text-lg text-white ${done ? 'bg-teal-700' : 'bg-[#1D4ED8]'}`}>
                      {done ? <Check className="w-5 h-5" /> : i + 1}
                    </span>
                    {next && <span className="flex-1 w-0.5 bg-border" />}
                    {next && <ArrowDown className="w-5 h-5 text-foreground/40 -mt-1" />}
                  </div>

                  <div className={`flex-1 min-w-0 rounded-sm border bg-card ${next ? 'mb-6' : ''} ${open ? 'border-[#1D4ED8]' : 'border-border'}`}>
                    {editMode && (
                      <div className="absolute -top-3 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-card border border-border rounded px-1 py-1">
                        <button onClick={() => move(i, -1)} aria-label="Move step up" className="p-1.5 hover:text-[#1D4ED8]"><ArrowUp className="w-4 h-4" /></button>
                        <button onClick={() => move(i, 1)} aria-label="Move step down" className="p-1.5 hover:text-[#1D4ED8]"><ArrowDown className="w-4 h-4" /></button>
                        <button onClick={() => setEditing(s)} aria-label="Edit step" className="p-1.5 hover:text-[#1D4ED8]"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => remove(s)} aria-label="Delete step" className="p-1.5 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    )}
                    <button onClick={() => setOpenMap((o) => ({ ...o, [s.id]: !open }))} aria-expanded={open} aria-controls={`step-body-${s.id}`}
                      className="w-full flex items-center gap-4 p-5 md:p-6 text-left">
                      <span className="flex-1 min-w-0">
                        <span className="block chrono-eyebrow mb-1">Step {i + 1} of {stageSteps.length}{done ? ' · Done' : ''}</span>
                        <span className="block font-display text-xl md:text-2xl leading-snug">{s.title}</span>
                        {s.subtitle && <span className="mt-1.5 block text-foreground/70">{s.subtitle}</span>}
                      </span>
                      <ChevronDown className={`shrink-0 w-5 h-5 transition-transform ${open ? 'rotate-180' : ''}`} />
                    </button>
                    {open && (
                      <div id={`step-body-${s.id}`} className="border-t border-border p-5 md:p-6 space-y-6">
                        <BlockCanvas section={section} sub={s.slug} emptyLabel="Ms Lowe hasn't added guidance to this step yet." />
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                          <button onClick={() => finish(s, next)} aria-pressed={done}
                            className={`inline-flex items-center gap-2 min-h-[44px] rounded-full px-5 text-sm font-bold transition-colors ${done ? 'bg-teal-700 text-white hover:bg-teal-800' : 'border-2 border-border hover:border-[#1D4ED8]'}`}>
                            {done ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                            {done ? 'Step done' : 'Mark this step as done'}
                          </button>
                          {next && (
                            <button onClick={() => jump(next)} className="inline-flex items-center gap-2 min-h-[44px] rounded-full bg-[#111827] px-5 text-sm font-bold text-white hover:bg-black">
                              Next: Step {i + 2} <ArrowDown className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ol>
        </>
      )}

      {stageSteps.length === 0 && !editMode && (
        <p className="py-10 text-foreground/40 italic">Steps for this section coming soon.</p>
      )}

      {editMode && (
        <Button variant="outline" size="sm" onClick={() => setEditing({})} className="mt-10">
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Add step
        </Button>
      )}

      <StepForm open={!!editing} onOpenChange={(o) => !o && setEditing(null)} initial={editing} onSave={save} />
    </div>
  );
}