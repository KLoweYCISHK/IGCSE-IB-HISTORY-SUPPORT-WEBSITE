import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Image } from '@/components/ui/image';
import ImageUploadField from './editor/ImageUploadField';
import SiteNav from './SiteNav';
import { Landmark, Settings } from 'lucide-react';
import { useTrack } from '@/lib/TrackContext';
import TrackLogo from './TrackLogo';

export default function Masthead() {
  const { editMode } = useAdmin();
  const { track } = useTrack();
  const [settings, setSettings] = useState(null);
  const [draft, setDraft] = useState(null);

  const load = async () => {
    const [first] = await store.entities.SiteSettings.list('', 1);
    setSettings(first || { title: 'IB History', subtitle: 'by Ms Lowe' });
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (settings?.id) await editDb.SiteSettings.update(settings.id, draft);
    else await editDb.SiteSettings.create(draft);
    setDraft(null);
    load();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#F4EFE3]/92 backdrop-blur-md">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-5 flex flex-wrap items-center justify-between gap-5">
        <Link to="/" className="flex items-center gap-4 group">
          {track ? (
            <TrackLogo track={track} size={48} />
          ) : (
            <span className="flex items-center justify-center w-12 h-12 rounded-full border border-[#6F551A] overflow-hidden shrink-0">
              {settings?.logo_url ? (
                <Image src={settings.logo_url} alt="Logo" className="w-full h-full" />
              ) : (
                <Landmark className="w-5 h-5 text-[#6F551A]" />
              )}
            </span>
          )}
          <span>
            <span className="block font-display text-3xl md:text-4xl leading-none tracking-[0.02em]">
              {track === 'igcse' ? 'iGCSE History' : (settings?.title || 'IB History')}
            </span>
            <span className="block font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mt-1.5">
              {settings?.subtitle || 'by Ms Lowe'}
            </span>
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <SiteNav />
          {editMode && (
            <button onClick={() => setDraft({ ...settings })} className="p-2 text-muted-foreground hover:text-[#6F551A]" title="Site identity">
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <Dialog open={!!draft} onOpenChange={(o) => !o && setDraft(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle className="font-display text-3xl">Site identity</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <ImageUploadField value={draft?.logo_url} onChange={(v) => setDraft((d) => ({ ...d, logo_url: v }))} label="Logo" />
            <Input value={draft?.title || ''} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Title" />
            <Input value={draft?.subtitle || ''} onChange={(e) => setDraft((d) => ({ ...d, subtitle: e.target.value }))} placeholder="Subtitle" />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setDraft(null)}>Cancel</Button>
            <Button onClick={save}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}