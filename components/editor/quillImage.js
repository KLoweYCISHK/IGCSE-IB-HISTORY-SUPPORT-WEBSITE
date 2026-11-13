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
