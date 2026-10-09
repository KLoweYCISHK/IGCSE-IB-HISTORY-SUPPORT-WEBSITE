import React from 'react';

export default function ArchiveTable({ rows = [] }) {
  if (!rows.length) return null;
  const [head, ...body] = rows;
  return (
    <div className="border border-border rounded-sm">
      <table className="w-full table-fixed border-collapse text-left">
        <colgroup>
          <col className="w-[28%]" />
          {head.slice(1).map((_, i) => (
            <col key={i} />
          ))}
        </colgroup>
        <thead className="bg-[#E8E0CE]">
          <tr>
            {head.map((h, i) => (
              <th key={i} className="px-4 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-foreground/80 border-b border-border align-top">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, r) => (
            <tr key={r} className={r % 2 ? 'bg-black/[0.03]' : ''}>
              {head.map((_, c) => (
                <td key={c} className="px-4 py-3 align-top text-[15px] text-foreground/85 border-b border-border/60 break-words">
                  <div className="prose-archive" dangerouslySetInnerHTML={{ __html: (row[c] ?? '').replace(/&nbsp;/g, ' ') }} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}