import React from 'react';
import { Link2, ExternalLink } from 'lucide-react';
import LinkCredentials from './LinkCredentials';

export default function LinkPill({ b }) {
  return (
    <div className="flex flex-col items-start gap-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        <a
          href={b.link_url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/10 hover:border-accent/40"
        >
          <Link2 className="w-4 h-4 text-muted-foreground" />
          {b.title || b.link_url}
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </a>
        <LinkCredentials username={b.link_username} password={b.link_password} />
      </div>
      {b.caption && <p className="text-xs text-muted-foreground max-w-[16rem]">{b.caption}</p>}
    </div>
  );
}