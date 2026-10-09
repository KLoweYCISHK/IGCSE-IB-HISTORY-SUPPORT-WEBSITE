import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTrack } from '@/lib/TrackContext';

const IB_NAV = [
  { to: '/historical-concepts', label: 'Historical Concepts' },
  { to: '/paper-1', label: 'Paper 1' },
  { to: '/paper-2', label: 'Paper 2' },
  { to: '/paper-3', label: 'Paper 3 (HL)' },
  { to: '/ia', label: 'IA' },
  { to: '/ee', label: 'EE' },
];

const IGCSE_NAV = [
  { to: '/igcse/core1', label: 'Core 1' },
  { to: '/igcse/core2', label: 'Core 2' },
  { to: '/igcse/depth', label: 'Depth' },
  { to: '/igcse/paper1', label: 'Paper 1' },
  { to: '/igcse/paper2', label: 'Paper 2' },
  { to: '/igcse/coursework', label: 'Coursework' },
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
            className={`block px-4 py-2 font-mono text-[11px] uppercase tracking-[0.22em] transition-colors ${
              pathname === item.to ? 'text-foreground' : 'text-foreground/50 hover:text-foreground'
            }`}
          >
            {item.label}
            <span className={`block mt-1.5 h-px transition-all duration-500 ${pathname === item.to ? 'bg-[#6F551A]' : 'bg-transparent group-hover:bg-border'}`} />
          </Link>
        </div>
      ))}
      <button
        onClick={switchTrack}
        className="ml-2 px-3 py-2 font-mono text-[10px] uppercase tracking-[0.22em] border border-border rounded-sm text-foreground/60 hover:text-[#6F551A] hover:border-[#6F551A] transition-colors"
        title={`Switch to ${track === 'igcse' ? 'IB' : 'IGCSE'}`}
      >
        {track === 'igcse' ? 'IB →' : 'IGCSE →'}
      </button>
    </nav>
  );
}