import Quill from 'quill';

let registered = false;

/**
 * Registers an atomic "arc-card" embed blot. The card is stored as an opaque
 * block (like an image) so Quill preserves its full styled HTML through every
 * edit and reload. Double-click a card to edit its inner content.
 */
export function ensureCardsRegistered() {
  if (registered) return;
  registered = true;

  const BlockEmbed = Quill.import('blots/block/embed');

  class CardEmbed extends BlockEmbed {
    static blotName = 'arc-card';
    static tagName = 'div';
    static className = 'arc-card';

    static create(value) {
      const node = super.create();
      const variant = value && value.variant ? value.variant : '';
      const inner = value && typeof value.inner === 'string' ? value.inner : '';
      if (variant) node.setAttribute('data-variant', variant);
      node.setAttribute('contenteditable', 'false');
      node.innerHTML = inner;
      return node;
    }

    static value(node) {
      return {
        variant: node.getAttribute('data-variant') || '',
        inner: node.innerHTML,
      };
    }

    formatAt() {
      /* embeds are opaque — never let inline formats bleed in */
    }
  }

  Quill.register(CardEmbed, true);
}

export const CARD_SNIPPETS = [
  {
    key: 'info',
    label: 'Info card',
    variant: 'info',
    inner:
      '<p><strong>What examiners want</strong></p><p>Clear understanding of how specific content from both sources helps answer the inquiry question.</p>',
  },
  {
    key: 'warning',
    label: 'Warning block',
    variant: 'warning',
    inner:
      '<p><strong>⚠ Important:</strong> The structure below is only a sample approach.</p><p>Different source combinations are possible. For example:</p><ul><li>both sources may support the argument</li><li>one source may strongly support while the other challenges</li></ul>',
  },
  {
    key: 'callout',
    label: 'Callout',
    variant: 'callout',
    inner: '<p><em>"One relevant point from Source A is…"</em></p>',
  },
  {
    key: 'support',
    label: 'Support card',
    variant: 'support',
    inner:
      '<p><strong>Possible ways sources can support the argument</strong></p><ul><li>Explain how a specific detail supports the argument</li><li>Link the evidence to the inquiry question</li></ul>',
  },
  {
    key: 'challenge',
    label: 'Challenge card',
    variant: 'challenge',
    inner:
      '<p><strong>Possible ways sources can challenge the argument</strong></p><ul><li>Explain how a source challenges the argument</li><li>Consider alternative causes</li></ul>',
  },
];

export function insertCard(quill, snippet) {
  if (!quill) return;
  const sel = quill.getSelection();
  const index = sel ? sel.index : quill.getLength();
  quill.insertEmbed(index, 'arc-card', { variant: snippet.variant, inner: snippet.inner }, 'user');
  quill.setSelection(index + 1, 0, 'user');
}

export function readCard(node) {
  if (!node) return null;
  const card = node.closest('.arc-card');
  if (!card) return null;
  return { variant: card.getAttribute('data-variant') || '', inner: card.innerHTML, node: card };
}

export function replaceCard(quill, node, value) {
  if (!quill || !node) return;
  const blot = Quill.find(node);
  if (!blot) return;
  const offset = blot.offset(quill.scroll);
  quill.deleteText(offset, blot.length(), 'user');
  quill.insertEmbed(offset, 'arc-card', value, 'user');
  quill.setSelection(offset + 1, 0, 'user');
}