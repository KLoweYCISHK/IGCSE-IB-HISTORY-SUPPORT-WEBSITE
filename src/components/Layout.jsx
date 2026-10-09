import React from 'react';
import { Outlet } from 'react-router-dom';
import { DragDropContext } from '@hello-pangea/dnd';
import Masthead from './Masthead';
import AdminBar from './AdminBar';
import { handleBlockDragEnd } from '@/lib/blockDnd';
import { useTrack } from '@/lib/TrackContext';

export default function Layout() {
  const { track } = useTrack();
  const title = track === 'igcse' ? 'IGCSE History — By Ms Lowe' : 'IB History — by Ms Lowe';
  return (
    <div className="min-h-screen bg-[#F4EFE3]">
      <Masthead />
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="relative md:pl-10">
          <div className="hidden md:block absolute left-0 top-0 bottom-0 w-px bg-border" />
          <DragDropContext onDragEnd={handleBlockDragEnd}>
            <main><Outlet /></main>
          </DragDropContext>
        </div>
      </div>
      <footer className="mt-24 border-t border-border">
        <div className="mx-auto max-w-[1400px] px-6 md:px-10 py-10 flex flex-wrap justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {title}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            The Chronos Archive
          </p>
        </div>
      </footer>
      <AdminBar />
    </div>
  );
}