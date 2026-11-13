// Key words: a glossary kept per unit. A key word is defined once for its unit (meaning + Simplified Chinese)
// and is then highlighted automatically wherever it appears in that unit's revision notes. Students click it
// to see the meaning. Stored as PageSection records on the page "glossary_terms": title = the key word,
// meaning, chinese, module = the unit it belongs to ("<notes page>::<unit>"), or "all" for every unit.
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { stripPasteArtifacts } from '@/lib/sanitizeHtml';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Pencil, Trash2, BookA } from 'lucide-react';

const PAGE = 'glossary_terms';
const GlossaryContext = createContext(null);
const ScopeContext = createContext(null); // { scope, label } of the unit the notes belong to, or null when key words are off

const SHARED = 'all';
export const unitScope = (page, module) => `${page}::${module || SHARED}`;
// The key words that apply in one unit: its own, plus any shared with every unit. A unit's own word wins over a shared one.
export function termsFor(terms, scope) {
  const own = terms.filter((t) => t.module === scope);
  const taken = new Set(own.map((t) => norm(t.title)));
  return [...own, ...terms.filter((t) => (t.module || SHARED) === SHARED && !taken.has(norm(t.title)))];
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const norm = (s) => String(s || '').trim().toLowerCase();

// Wraps every key word found in the HTML in a clickable button. Longest key words win ("Treaty of Versailles" before "Treaty").
export function highlightTerms(html, terms) {
  const list = terms.filter((t) => norm(t.title)).sort((a, b) => b.title.length - a.title.length);
  if (!html || !list.length || typeof DOMParser === 'undefined') return html;
  const byKey = new Map(list.map((t) => [norm(t.title), t]));
  const body = list.map((t) => escapeRe(t.title.trim())).join('|');
  // whole words only; a simple plural ("treaties" is not covered, "soviets" is)
  const re = new RegExp(`(?<![\\p{L}\\p{N}])(${body})(s|es)?(?![\\p{L}\\p{N}])`, 'giu');

  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const root = doc.body.firstChild;
  const walker = doc.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) {
    const n = walker.currentNode;
    if (!n.parentElement.closest('a, button, code, pre')) nodes.push(n);
  }
  nodes.forEach((node) => {
    const text = node.nodeValue;
    re.lastIndex = 0;
    let last = 0; let m; const frag = doc.createDocumentFragment(); let found = false;
    while ((m = re.exec(text))) {
      const term = byKey.get(norm(m[1]));
      if (!term) continue;
      found = true;
      frag.append(text.slice(last, m.index));
      const btn = doc.createElement('button');
      btn.type = 'button';
      btn.className = 'key-term';
      btn.setAttribute('data-term', term.id);
      btn.textContent = m[0];
      frag.append(btn);
      last = m.index + m[0].length;
    }
    if (found) { frag.append(text.slice(last)); node.replaceWith(frag); }
  });
  return root.innerHTML;
}

function TermForm({ initial, onClose, onSaved }) {
  const [draft, setDraft] = useState(initial || {});
  const [saving, setSaving] = useState(false);
  useEffect(() => { setDraft(initial || {}); }, [initial]);
  const set = (k, v) => setDraft((d) => ({ ...d, [k]: v }));
  // scope = the unit this key word is being added or edited in
  const scope = draft.scope && draft.scope !== SHARED ? draft.scope : null;
  const shared = !scope || (draft.module || (draft.id ? SHARED : scope)) === SHARED;
  const save = async () => {
    setSaving(true);
    try {
      const data = { title: draft.title.trim(), meaning: (draft.meaning || '').trim(), chinese: (draft.chinese || '').trim(), module: shared ? SHARED : scope };
      if (draft.id) await editDb.PageSection.update(draft.id, data);
      else await editDb.PageSection.create({ ...data, page: PAGE, slug: `term_${Date.now()}`, order: 0 });
      onSaved();
    } finally { setSaving(false); }
  };
  return (
    <Dialog open={!!initial} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">{initial?.id ? 'Edit key word' : 'New key word'}</DialogTitle>
          <DialogDescription>
            {shared ? 'Define it once. It is then highlighted in the revision notes of every unit.' : `Define it once. It is then highlighted wherever it appears in ${draft.scopeLabel || 'this unit'}, and only there.`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-1">
          <div className="space-y-1.5">
            <p className="chrono-eyebrow">Key word</p>
            <Input value={draft.title || ''} onChange={(e) => set('title', e.target.value)} placeholder="e.g. reparations" />
          </div>
          <div className="space-y-1.5">
            <p className="chrono-eyebrow">Meaning</p>
            <Textarea rows={3} value={draft.meaning || ''} onChange={(e) => set('meaning', e.target.value)} placeholder="A short, student-friendly definition" />
          </div>
          <div className="space-y-1.5">
            <p className="chrono-eyebrow">Simplified Chinese (简体中文)</p>
            <Textarea rows={2} lang="zh-Hans" value={draft.chinese || ''} onChange={(e) => set('chinese', e.target.value)} placeholder="例如：赔款" />
          </div>
          {scope && (
            <label className="flex items-start gap-3 text-sm cursor-pointer">
              <input type="checkbox" className="mt-1 w-4 h-4 accent-[#1D4ED8]" checked={shared} onChange={(e) => set('module', e.target.checked ? SHARED : scope)} />
              <span><span className="font-semibold">Use in every unit</span><span className="block text-foreground/70">Leave unticked to keep this key word in {draft.scopeLabel || 'this unit'} only.</span></span>
            </label>
          )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button disabled={!draft.title?.trim() || !(draft.meaning?.trim() || draft.chinese?.trim()) || saving} onClick={save} className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white">
            {saving ? 'Saving…' : 'Save key word'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TermRow({ t, onEdit, onRemove, extra }) {
  return (
    <li className="flex flex-wrap items-start gap-3 p-4">
      <div className="flex-1 min-w-[12rem]">
        <p className="font-bold">{t.title}{t.chinese && <span lang="zh-Hans" className="ml-3 font-normal text-[#1E40AF]">{t.chinese}</span>}</p>
        {t.meaning && <p className="text-sm text-foreground/70">{t.meaning}</p>}
      </div>
      {extra}
      <button onClick={onEdit} aria-label={`Edit ${t.title}`} className="p-2 hover:text-[#1D4ED8]"><Pencil className="w-4 h-4" /></button>
      <button onClick={onRemove} aria-label={`Delete ${t.title}`} className="p-2 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
    </li>
  );
}

export function GlossaryProvider({ children }) {
  const { editMode } = useAdmin();
  const [terms, setTerms] = useState([]);
  const [viewing, setViewing] = useState(null);
  const [editing, setEditing] = useState(null);
  const [managing, setManaging] = useState(null); // { scope, label } of the unit whose key words are being managed
  const [pick, setPick] = useState(null); // text the teacher has selected, with where to show the button

  const load = useCallback(async () => {
    try { setTerms((await store.entities.PageSection.filter({ page: PAGE })).filter((t) => !t.is_deleted)); }
    catch { setTerms([]); }
  }, []);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!pick) return undefined;
    const clear = () => { if (!String(window.getSelection?.() || '').trim()) setPick(null); };
    const hide = () => setPick(null);
    document.addEventListener('selectionchange', clear);
    window.addEventListener('scroll', hide, { passive: true });
    return () => { document.removeEventListener('selectionchange', clear); window.removeEventListener('scroll', hide); };
  }, [pick]);

  const value = useMemo(() => ({
    terms,
    open: (id, unit) => { const t = terms.find((x) => x.id === id); setViewing(t ? { ...t, scope: unit?.scope, scopeLabel: unit?.label } : null); },
    manage: (unit) => setManaging(unit || {}),
    offer: (text, rect, unit) => setPick({ text, x: rect.left + rect.width / 2, y: rect.top, unit }),
  }), [terms]);

  const remove = async (t) => { await editDb.PageSection.delete(t.id); load(); };
  const byTitle = (a, b) => a.title.localeCompare(b.title);
  const unitTerms = managing?.scope ? terms.filter((t) => t.module === managing.scope).sort(byTitle) : [];
  const sharedTerms = terms.filter((t) => (t.module || SHARED) === SHARED).sort(byTitle);
  const inUnit = (t) => ({ ...t, scope: managing?.scope, scopeLabel: managing?.label });
  const move = async (t, module) => { await editDb.PageSection.update(t.id, { module }); load(); };

  return (
    <GlossaryContext.Provider value={value}>
      {children}

      {/* student pop-up */}
      <Dialog open={!!viewing} onOpenChange={(o) => !o && setViewing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogDescription className="chrono-eyebrow">Key word</DialogDescription>
            <DialogTitle className="font-display text-3xl">{viewing?.title}</DialogTitle>
          </DialogHeader>
          {viewing?.chinese && <p lang="zh-Hans" className="text-2xl leading-snug text-[#1E40AF]">{viewing.chinese}</p>}
          {viewing?.meaning && <p className="text-[17px] leading-relaxed">{viewing.meaning}</p>}
          {editMode && (
            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => { setEditing(viewing); setViewing(null); }}><Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit</Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* teacher: "make this a key word" button next to selected text */}
      {editMode && pick && (
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => { setEditing({ title: pick.text, scope: pick.unit?.scope, scopeLabel: pick.unit?.label }); setPick(null); }}
          style={{ left: Math.max(90, Math.min(pick.x, window.innerWidth - 90)), top: Math.max(8, pick.y - 48) }}
          className="fixed z-[60] -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-[#111827] text-white px-4 min-h-[40px] text-sm font-bold shadow-xl"
        >
          <BookA className="w-4 h-4" /> Make key word
        </button>
      )}

      {/* teacher: manage the key words of one unit */}
      <Dialog open={!!managing} onOpenChange={(o) => !o && setManaging(null)}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl">Key words{managing?.label ? `: ${managing.label}` : ''}</DialogTitle>
            <DialogDescription>Key words belong to this unit. They are highlighted only in this unit's revision notes, unless you choose to use one in every unit.</DialogDescription>
          </DialogHeader>
          <div><Button size="sm" onClick={() => setEditing(inUnit({}))} className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white"><Plus className="w-3.5 h-3.5 mr-1.5" /> Add key word to this unit</Button></div>

          <p className="chrono-eyebrow">This unit ({unitTerms.length})</p>
          {unitTerms.length === 0 ? <p className="text-foreground/60">No key words in this unit yet.</p> : (
            <ul className="divide-y divide-border border border-border rounded-sm">
              {unitTerms.map((t) => (
                <TermRow key={t.id} t={t} onEdit={() => setEditing(inUnit(t))} onRemove={() => remove(t)} />
              ))}
            </ul>
          )}

          {sharedTerms.length > 0 && (
            <>
              <p className="chrono-eyebrow pt-2">Used in every unit ({sharedTerms.length})</p>
              <p className="text-sm text-foreground/70 -mt-2">These are highlighted in all units. Use "This unit only" to keep one in this unit and remove it from the others.</p>
              <ul className="divide-y divide-border border border-border rounded-sm">
                {sharedTerms.map((t) => (
                  <TermRow key={t.id} t={t} onEdit={() => setEditing(inUnit(t))} onRemove={() => remove(t)}
                    extra={managing?.scope && <Button variant="outline" size="sm" onClick={() => move(t, managing.scope)}>This unit only</Button>} />
                ))}
              </ul>
            </>
          )}
        </DialogContent>
      </Dialog>

      <TermForm initial={editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />
    </GlossaryContext.Provider>
  );
}

// Wrap a unit's revision notes in this to switch its key words on for everything inside.
// scope says which unit the notes belong to (see unitScope); label is the unit's name, shown to the teacher.
export function KeyTermScope({ on, scope, label, children }) {
  const value = useMemo(() => (on ? { scope: scope || SHARED, label } : null), [on, scope, label]);
  return <ScopeContext.Provider value={value}>{children}</ScopeContext.Provider>;
}

// Rich text that highlights the unit's key words when inside a KeyTermScope; otherwise plain.
export function KeyTermHtml({ html, className }) {
  const g = useContext(GlossaryContext);
  const unit = useContext(ScopeContext);
  const { editMode } = useAdmin();
  const clean = stripPasteArtifacts(html || '');
  const active = !!(unit && g);
  const scope = unit?.scope;
  const out = useMemo(() => (active ? highlightTerms(clean, termsFor(g.terms, scope)) : clean), [active, clean, g?.terms, scope]);

  const onClick = (e) => {
    const el = e.target.closest?.('[data-term]');
    if (el) g.open(el.getAttribute('data-term'), unit);
  };
  const onMouseUp = () => {
    if (!editMode) return;
    const sel = window.getSelection?.();
    const text = String(sel || '').trim();
    if (!text || text.length > 60 || text.includes('\n') || !sel.rangeCount) return;
    g.offer(text, sel.getRangeAt(0).getBoundingClientRect(), unit);
  };

  return (
    <div className={className} onClick={active ? onClick : undefined} onMouseUp={active ? onMouseUp : undefined}
      dangerouslySetInnerHTML={{ __html: out }} />
  );
}

// "Key words" button for the teacher, shown inside a unit's revision notes in edit mode.
export function ManageKeyTermsButton() {
  const g = useContext(GlossaryContext);
  const unit = useContext(ScopeContext);
  if (!g || !unit) return null;
  return (
    <Button variant="outline" size="sm" onClick={() => g.manage(unit)}>
      <BookA className="w-3.5 h-3.5 mr-1.5" /> Key words for this unit ({g.terms.filter((t) => t.module === unit.scope).length})
    </Button>
  );
}
