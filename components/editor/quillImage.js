import Quill from 'quill';

let registered = false;

// Attributes an image in the notes can carry: width (a percentage of the text width) and where it sits.
const ATTRS = ['alt', 'width', 'height', 'data-align'];

/**
 * Images inside rich text. Replaces Quill's image so each picture remembers its
 * width (e.g. "40%") and its placement (data-align: left, right or center)
 * through every edit and reload.
 */
export function ensureImageRegistered() {
  if (registered) return;
  registered = true;

  const BaseImage = Quill.import('formats/image');

  class NoteImage extends BaseImage {
    static formats(node) {
      return ATTRS.reduce((formats, name) => {
        if (node.hasAttribute(name)) formats[name] = node.getAttribute(name);
        return formats;
      }, {});
    }

    format(name, value) {
      if (!ATTRS.includes(name)) { super.format(name, value); return; }
      if (value) this.domNode.setAttribute(name, value);
      else this.domNode.removeAttribute(name);
    }
  }

  Quill.register(NoteImage, true);
}

// Where the cursor is, or the end of the notes if the editor has not been clicked yet.
const cursorIndex = (quill) => {
  const range = quill.getSelection();
  return range ? range.index + range.length : Math.max(0, quill.getLength() - 1);
};

export function insertImage(quill, url, index = cursorIndex(quill)) {
  if (!quill || !url) return;
  quill.insertEmbed(index, 'image', url, 'user');
  quill.formatText(index, 1, { width: '50%' }, 'user');
  quill.setSelection(index + 1, 0, 'silent');
}

// Changes one image's width or placement. Returns false if the image is no longer in the notes.
export function formatImage(quill, node, formats) {
  const blot = node?.isConnected ? Quill.find(node) : null;
  if (!quill || !blot) return false;
  quill.formatText(quill.getIndex(blot), 1, formats, 'user');
  return true;
}

export function removeImage(quill, node) {
  const blot = node?.isConnected ? Quill.find(node) : null;
  if (!quill || !blot) return;
  const index = quill.getIndex(blot);
  quill.deleteText(index, 1, 'user');
  quill.setSelection(index, 0, 'silent');
}


// Moves a picture to another place in the notes (index `to`), keeping its size and placement.
// Returns where it now sits, or null if it did not move.
export function moveImage(quill, node, to) {
  const blot = node?.isConnected ? Quill.find(node) : null;
  if (!quill || !blot || typeof to !== 'number') return null;
  const from = quill.getIndex(blot);
  if (to === from || to === from + 1) return null;

  const attributes = {};
  ATTRS.forEach((name) => { if (node.hasAttribute(name)) attributes[name] = node.getAttribute(name); });
  const link = node.closest('a')?.getAttribute('href');
  if (link) attributes.link = link;
  const picture = { image: node.getAttribute('src') };

  const Delta = Quill.import('delta');
  const change = to > from
    ? new Delta().retain(from).delete(1).retain(to - from - 1).insert(picture, attributes)
    : new Delta().retain(to).insert(picture, attributes).retain(from - to).delete(1);
  quill.updateContents(change, 'user');

  const at = to > from ? to - 1 : to;
  quill.setSelection(at + 1, 0, 'silent');
  return at;
}

// The place in the notes under the mouse, as a Quill index (null if the mouse is not over the text).
export function indexAtPoint(quill, x, y) {
  let native = null;
  if (document.caretRangeFromPoint) {
    native = document.caretRangeFromPoint(x, y);
  } else if (document.caretPositionFromPoint) {
    const pos = document.caretPositionFromPoint(x, y);
    if (pos) {
      native = document.createRange();
      native.setStart(pos.offsetNode, pos.offset);
      native.setEnd(pos.offsetNode, pos.offset);
    }
  }
  if (!native || !quill.root.contains(native.startContainer)) return null;
  const normalized = quill.selection.normalizeNative(native);
  return normalized ? quill.selection.normalizedToRange(normalized).index : null;
}
