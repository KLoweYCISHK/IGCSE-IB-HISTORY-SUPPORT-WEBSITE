import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTrack } from '@/lib/TrackContext';

export const IB_NAV = [
  { to: '/historical-concepts', label: 'Historical Concepts' },
  { to: '/paper-1', label: 'Paper 1' },
  { to: '/paper-2', label: 'Paper 2' },
  { to: '/paper-3', label: 'Paper 3 (HL)' },
  { to: '/ia', label: 'IA' },
  { to: '/ee', label: 'EE' },
  { to: '/revision', label: 'Revise' },
  { to: '/historians', label: 'Historians' },
];

export const IGCSE_NAV = [
  { to: '/igcse/core1', label: 'Core 1' },
  { to: '/igcse/core2', label: 'Core 2' },
  { to: '/igcse/depth', label: 'Depth' },
  { to: '/igcse/paper1', label: 'Paper 1' },
  { to: '/igcse/paper2', label: 'Paper 2' },
  { to: '/igcse/coursework', label: 'Coursework' },
  { to: '/revision', label: 'Revise' },
];

export default function SiteNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { track, setTrack } = useTrack();
  const nav = track === 'igcse' ? IGCSE_NAV : IB_NAV;

  const switchTrack = () => {
    const next = track === 'igcse' ? 'ib' : 'igcse';
    setTrack(next);
    navigate('/');
  };

  return (
    <nav className="flex flex-wrap items-center gap-x-1 gap-y-2">
      {nav.map((item) => (
        <div key={item.to} className="relative group">
          <Link
            to={item.to}
            aria-current={pathname === item.to ? 'page' : undefined}
            className={`block px-3 py-2 text-sm font-semibold transition-colors ${
              pathname === item.to ? 'text-[#1D4ED8]' : 'text-foreground/70 hover:text-foreground'
            }`}
          >
            {item.label}
            <span className={`block mt-1 h-0.5 rounded-full transition-all ${pathname === item.to ? 'bg-[#1D4ED8]' : 'bg-transparent group-hover:bg-border'}`} />
          </Link>
        </div>
      ))}
      <button
        onClick={switchTrack}
        className="ml-2 min-h-[40px] px-4 text-sm font-bold border border-border rounded-full text-foreground/80 hover:text-[#1D4ED8] hover:border-[#1D4ED8] transition-colors"
        title={`Switch to ${track === 'igcse' ? 'IB' : 'IGCSE'}`}
      >
        {track === 'igcse' ? 'Switch to IB' : 'Switch to IGCSE'}
      </button>
    </nav>
  );
}