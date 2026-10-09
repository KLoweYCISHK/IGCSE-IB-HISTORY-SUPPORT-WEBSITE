import React, { useCallback, useEffect, useState } from 'react';
import { store } from '@/api/firebaseClient';
import { editDb } from '@/api/editor';
import { useAdmin } from '@/lib/AdminContext';
import { Image } from '@/components/ui/image';
import { Pencil } from 'lucide-react';
import HeroForm from './HeroForm';

export default function PageHero({ page, eyebrow, title, lede, image }) {
  const { editMode } = useAdmin();
  const [meta, setMeta] = useState(null);
  const [editing, setEditing] = useState(false);

  const load = useCallback(async () => {
    if (!page) { setMeta(null); return; }
    const list = await store.entities.PageMeta.filter({ page });
    setMeta(list[0] || null);
  }, [page]);

  useEffect(() => {
    load();
    const handler = () => load();
    window.addEventListener('archive:reload', handler);
    return () => window.removeEventListener('archive:reload', handler);
  }, [load]);

  const save = async (draft) => {
    if (meta?.id) await editDb.PageMeta.update(meta.id, draft);
    else await editDb.PageMeta.create({ page, ...draft });
    setEditing(false);
    load();
  };

  const eEyebrow = meta?.eyebrow ?? eyebrow;
  const eTitle = meta?.title ?? title;
  const eLede = meta?.description ?? lede;
  const eImage = meta?.image_url ?? image;
  const eSideImage = meta?.side_image_url;

  return (
    <header className="relative pt-16 pb-14 md:pt-24 md:pb-20 overflow-hidden">
      {eImage && (
        <div className="absolute inset-0 -z-10">
          <Image src={eImage} alt="" className="w-full h-full object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#F4EFE3] via-[#F4EFE3]/85 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#F4EFE3] to-transparent" />
        </div>
      )}
      <p className="chrono-eyebrow mb-5">{eEyebrow}</p>
      <div className="flex flex-col md:flex-row md:items-center gap-8 md:gap-12">
        <div className="flex-1 min-w-0">
          <h1 className="font-display text-6xl md:text-8xl leading-[0.92] tracking-tight">{eTitle}</h1>
          {eLede && <div className="prose-archive mt-6 max-w-2xl text-lg text-foreground/70 leading-relaxed" dangerouslySetInnerHTML={{ __html: (eLede || '').replace(/&nbsp;|\u00A0/g, ' ') }} />}
        </div>
        {eSideImage && (
          <div className="w-full md:w-[38%] lg:w-[34%] shrink-0">
            <Image src={eSideImage} alt="" className="w-full h-48 md:h-56 object-cover rounded-sm border border-border" />
          </div>
        )}
      </div>

      {editMode && (
        <button
          onClick={() => setEditing(true)}
          className="absolute top-4 right-4 inline-flex items-center gap-1.5 border border-border bg-card/90 px-3 py-1.5 rounded-sm text-xs hover:text-[#6F551A]"
        >
          <Pencil className="w-3.5 h-3.5" /> Edit hero
        </button>
      )}

      <HeroForm
        open={editing}
        onOpenChange={setEditing}
        initial={{ eyebrow: eEyebrow, title: eTitle, description: eLede, image_url: eImage, side_image_url: eSideImage }}
        onSave={save}
      />
    </header>
  );
}