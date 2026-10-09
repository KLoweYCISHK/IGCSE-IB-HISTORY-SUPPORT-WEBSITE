// Paste from Google Docs / Word often replaces normal spaces with non-breaking
// spaces (&nbsp; / U+00A0). That turns whole paragraphs into one unbreakable
// line that overflows the column. Collapse them back to regular spaces so text
// wraps naturally.
export function stripPasteArtifacts(html) {
  if (!html) return '';
  return html
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00A0/g, ' ')
    .replace(/\sstyle\s*=\s*"\s*"/gi, '');
}