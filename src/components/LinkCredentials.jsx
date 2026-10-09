import React, { useState } from 'react';
import { Eye, EyeOff, User, KeyRound } from 'lucide-react';

export default function LinkCredentials({ username, password }) {
  const [show, setShow] = useState(false);

  if (!username && !password) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        title={show ? 'Hide login' : 'Show login'}
        aria-label={show ? 'Hide login' : 'Show login'}
        className="inline-flex items-center justify-center w-9 h-9 shrink-0 rounded-full border border-border bg-secondary text-muted-foreground hover:text-[#6F551A] hover:border-accent/40 transition-colors"
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
      {show && (
        <div className="w-60 rounded-sm border border-dashed border-border bg-secondary/40 p-3 space-y-1.5">
          {username && (
            <div className="flex items-center gap-2 font-mono text-xs">
              <User className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Username:</span>
              <span className="text-foreground break-all">{username}</span>
            </div>
          )}
          {password && (
            <div className="flex items-center gap-2 font-mono text-xs">
              <KeyRound className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground">Password:</span>
              <span className="text-foreground break-all">{password}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}