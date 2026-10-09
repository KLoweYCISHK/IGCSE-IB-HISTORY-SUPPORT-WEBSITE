import React, { useCallback, useEffect, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ExternalLink, Pencil, Trash2, Plus, FileText, Download, Folder, FolderOpen, FolderPlus, ChevronDown } from 'lucide-react';
import SectionHeading from './SectionHeading';
import ResourceForm from './ResourceForm';
import LinkCredentials from './LinkCredentials';

function ResourceCard({ r, editMode, onEdit, onDelete }) {
  return (
    <div className="glassine group relative border border-border rounded-sm overflow-hidden bg-card">
      <div className="p-5">
        <h4 className="font-display text-xl leading-snug">{r.title}</h4>
        {r.description && <p className="mt-2 text-sm text-foreground/60 leading-relaxed">{r.description}</p>}

        {r.file_url && (
          <a href={r.file_url} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 rounded-sm border border-border bg-secondary/40 px-3 py-2 text-sm hover:bg-secondary/70">
            <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="break-all min-w-0">{r.file_name || 'Document'}</span>
            <Download className="w-3.5 h-3.5 text-[#6F551A] shrink-0" />
          </a>
        )}

        {Array.isArray(r.links) && r.links.filter((l) => l.url || l.title).length > 0 && (
          <div className="mt-3 space-y-1.5 border-t border-border pt-3">
            {r.links.filter((l) => l.url || l.title).map((l, i) => (
              <a key={i} href={l.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-sm text-[#6F551A] hover:underline">
                <ExternalLink className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span className="min-w-0">
                  <span className="break-all">{l.title || l.url}</span>
                  {l.description && <span className="block text-foreground/50 text-xs">{l.description}</span>}
                </span>
              </a>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {r.url && (
              <a href={r.url} target="_blank" rel="noreferrer" className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#6F551A] inline-flex items-center gap-1.5">
                Open <ExternalLink className="w-3 h-3" />
              </a>
            )}
            <LinkCredentials username={r.link_username} password={r.link_password} />
          </div>
          {r.is_student_submission && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              added by {r.submitted_by || 'a student'}
            </span>
          )}
        </div>
      </div>
      {editMode && (
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition bg-card/90 border border-border rounded">
          <button onClick={() => onEdit(r)} className="p-1.5 hover:text-[#6F551A]"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => onDelete(r)} className="p-1.5 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
        </div>
      )}
    </div>
  );
}

function ResourceGrid({ items, ...rest }) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {items.map((r) => <ResourceCard key={r.id} r={r} {...rest} />)}
    </div>
  );
}

export default function ResourceLibrary({ section, caseStudy, module, title = 'The Resource Vault', description = "Curated documents, archives, videos and readings. Students may add a link they've found." }) {
  const { editMode, isAdmin } = useAdmin();
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [folderDraft, setFolderDraft] = useState(null);
  const [openFolders, setOpenFolders] = useState({});

  const load = useCallback(async () => {
    const query = { section };
    if (caseStudy) query.case_study = caseStudy;
    const list = await store.entities.Resource.filter(query, 'created_date');
    setItems(module ? list.filter((r) => r.module === module) : list);
  }, [section, caseStudy, module]);

  useEffect(() => { load(); }, [load]);

  // Folders are stored alongside resources, marked with is_folder.
  const folders = items.filter((r) => r.is_folder).sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  const folderIds = new Set(folders.map((f) => f.id));
  const resources = items.filter((r) => !r.is_folder);
  const loose = resources.filter((r) => !folderIds.has(r.folder_id));

  const save = async (draft) => {
    const { id, ...data } = draft;
    if (id) await editDb.Resource.update(id, data);
    else {
      const payload = { ...data, section, case_study: caseStudy || 'all', is_student_submission: !isAdmin };
      if (module) payload.module = data.module || module;
      await (isAdmin ? editDb : store.entities).Resource.create(payload);
    }
    if (data.folder_id) setOpenFolders((o) => ({ ...o, [data.folder_id]: true }));
    setEditing(null);
    load();
  };

  const saveFolder = async () => {
    const name = (folderDraft.title || '').trim();
    if (!name) return;
    if (folderDraft.id) await editDb.Resource.update(folderDraft.id, { title: name });
    else {
      const payload = { title: name, is_folder: true, section, case_study: caseStudy || 'all', is_student_submission: false };
      if (module) payload.module = module;
      await editDb.Resource.create(payload);
    }
    setFolderDraft(null);
    load();
  };

  const deleteFolder = async (f) => {
    if (!window.confirm(`Delete the folder "${f.title}"? Anything inside it stays in the vault, outside a folder.`)) return;
    await editDb.Resource.updateMany({ folder_id: f.id }, { folder_id: '' });
    await editDb.Resource.delete(f.id);
    load();
  };

  const cardProps = {
    editMode,
    onEdit: setEditing,
    onDelete: async (r) => { await editDb.Resource.delete(r.id); load(); },
  };

  return (
    <section className="py-16 md:py-24">
      <SectionHeading
        eyebrow="Useful resources"
        title={title}
        description={description}
        right={
          <div className="flex flex-wrap gap-2 justify-end">
            {isAdmin && (
              <Button variant="outline" onClick={() => setFolderDraft({ title: '' })} className="border-[#6F551A] text-[#6F551A]">
                <FolderPlus className="w-4 h-4 mr-1.5" /> Add a folder
              </Button>
            )}
            <Button onClick={() => setEditing({})} className="bg-[#6F551A] hover:bg-[#5A4514] text-[#F4EFE3]">
              <Plus className="w-4 h-4 mr-1.5" /> Add a resource
            </Button>
          </div>
        }
      />

      {items.length === 0 && <p className="text-foreground/40 italic">No resources yet.</p>}

      {folders.length > 0 && (
        <div className="space-y-3 mb-8">
          {folders.map((f) => {
            const inside = resources.filter((r) => r.folder_id === f.id);
            const isOpen = !!openFolders[f.id];
            const FolderIcon = isOpen ? FolderOpen : Folder;
            return (
              <div key={f.id} className="border border-border rounded-sm bg-card">
                <div className="flex items-center gap-2 pr-2">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFolders((o) => ({ ...o, [f.id]: !isOpen }))}
                    className="flex flex-1 min-w-0 items-center gap-3 px-5 py-4 text-left"
                  >
                    <FolderIcon className="w-5 h-5 text-[#6F551A] shrink-0" />
                    <span className="font-display text-xl leading-snug min-w-0 break-words">{f.title}</span>
                    <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground shrink-0">
                      {inside.length} {inside.length === 1 ? 'item' : 'items'}
                    </span>
                    <ChevronDown className={`w-4 h-4 ml-auto shrink-0 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {editMode && (
                    <div className="flex gap-1 shrink-0">
                      <button onClick={() => setFolderDraft({ id: f.id, title: f.title })} className="p-1.5 hover:text-[#6F551A]" aria-label="Rename folder"><Pencil className="w-4 h-4" /></button>
                      <button onClick={() => deleteFolder(f)} className="p-1.5 hover:text-destructive" aria-label="Delete folder"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
                {isOpen && (
                  <div className="border-t border-border p-5 space-y-4">
                    {inside.length === 0
                      ? <p className="text-foreground/40 italic">Nothing in this folder yet.</p>
                      : <ResourceGrid items={inside} {...cardProps} />}
                    <Button variant="ghost" size="sm" onClick={() => setEditing({ folder_id: f.id })} className="text-[#6F551A]">
                      <Plus className="w-3.5 h-3.5 mr-1" /> Add to {f.title}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {loose.length > 0 && <ResourceGrid items={loose} {...cardProps} />}

      <ResourceForm open={!!editing} onOpenChange={(o) => !o && setEditing(null)} initial={editing} onSave={save} module={module} folders={folders} />

      <Dialog open={!!folderDraft} onOpenChange={(o) => !o && setFolderDraft(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-3xl">{folderDraft?.id ? 'Rename folder' : 'Add a folder'}</DialogTitle>
          </DialogHeader>
          <Input
            autoFocus
            value={folderDraft?.title || ''}
            onChange={(e) => setFolderDraft((d) => ({ ...d, title: e.target.value }))}
            onKeyDown={(e) => { if (e.key === 'Enter') saveFolder(); }}
            placeholder="Folder name, e.g. Podcasts"
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setFolderDraft(null)}>Cancel</Button>
            <Button disabled={!folderDraft?.title?.trim()} onClick={saveFolder} className="bg-[#6F551A] hover:bg-[#5A4514] text-[#F4EFE3]">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
