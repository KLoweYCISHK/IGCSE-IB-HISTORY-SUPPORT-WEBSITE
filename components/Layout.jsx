import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { IB_NAV, IGCSE_NAV } from './SiteNav';
import { setLast } from '@/lib/progress';
import { DragDropContext } from '@hello-pangea/dnd';
import Masthead from './Masthead';
import AdminBar from './AdminBar';
import { handleBlockDragEnd } from '@/lib/blockDnd';
import { useTrack } from '@/lib/TrackContext';

export default function Layout() {
  const { track } = useTrack();
  const { pathname } = useLocation();

  // remember the last page a student opened, for "pick up where you left off" on the home page
  useEffect(() => {
    if (!track) return;
    const item = (track === 'igcse' ? IGCSE_NAV : IB_NAV).find((n) => n.to === pathname);
    if (item) setLast({ path: pathname, label: item.label, track });
  }, [pathname, track]);

  const title = track === 'igcse' ? 'IGCSE History — By Ms Lowe' : 'IB History — by Ms Lowe';
  return (
    <div className="min-h-screen bg-[#FFFFFF]">
      <Masthead />
      <div className="mx-auto max-w-[1240px] px-6 md:px-10">
        <DragDropContext onDragEnd={handleBlockDragEnd}>
          <main><Outlet /></main>
        </DragDropContext>
      </div>
      <footer className="mt-24 border-t border-border">
        <div className="mx-auto max-w-[1240px] px-6 md:px-10 py-10 flex flex-wrap justify-between gap-4">
          <p className="text-xs font-semibold text-muted-foreground">
            {title}
          </p>
          <p className="text-xs font-semibold text-muted-foreground">
            History Support Website
          </p>
        </div>
      </footer>
      <AdminBar />
    </div>
  );
}