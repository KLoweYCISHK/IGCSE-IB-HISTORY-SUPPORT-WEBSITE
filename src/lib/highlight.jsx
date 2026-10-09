import React from 'react';

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export default function Highlight({ text = '', query = '' }) {
  const terms = query.trim().split(/\s+/).filter((t) => t.length > 1);
  if (!terms.length) return <>{text}</>;
  const re = new RegExp(`(${terms.map(escape).join('|')})`, 'gi');
  return (
    <>
      {String(text).split(re).map((part, i) =>
        re.test(part) && terms.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
          <mark key={i} className="bg-[#6F551A] text-[#F4EFE3] px-0.5 rounded-sm">{part}</mark>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

export const matchesQuery = (haystack, query) => {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = haystack.toLowerCase();
  return q.split(/\s+/).some((t) => t.length > 1 && hay.includes(t)) || hay.includes(q);
};