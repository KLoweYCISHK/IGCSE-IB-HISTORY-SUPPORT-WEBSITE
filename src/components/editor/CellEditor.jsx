import React, { useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const modules = {
  toolbar: [['bold', 'italic'], [{ list: 'bullet' }, { list: 'ordered' }]],
};

const isEmpty = (v) => !v || v === '<p></p>' || v === '<p><br></p>' || v === '<p><br/></p>';
const sameContent = (a, b) => (isEmpty(a) && isEmpty(b)) || a === b;

export default function CellEditor({ value, onChange, placeholder }) {
  // Track the last content we propagated to the parent so an echoed change
  // event (Quill re-normalizing the same value) doesn't loop back as a setState.
  const lastSync = useRef(value || '');

  const handleChange = (v) => {
    if (sameContent(v, lastSync.current)) return;
    lastSync.current = v;
    onChange(v);
  };

  return (
    <div className="cell-editor">
      <ReactQuill
        theme="snow"
        value={value || ''}
        onChange={handleChange}
        modules={modules}
        placeholder={placeholder || 'Write...'}
      />
    </div>
  );
}