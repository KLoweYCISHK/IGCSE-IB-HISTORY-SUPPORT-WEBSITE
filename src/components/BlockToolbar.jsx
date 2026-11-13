import React from 'react';
import { Pencil, Trash2, GripVertical, FolderInput } from 'lucide-react';

export default function BlockToolbar({ dragHandleProps, onEdit, onRemove, onMove }) {
  return (
    <div className="absolute -top-3 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-card border border-border rounded px-1 py-1">
      <span
        {...dragHandleProps}
        title="Drag to reorder or move section"
        className="p-1.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-[#1D4ED8]"
      >
        <GripVertical className="w-4 h-4" />
      </span>
      {onMove && <button onClick={onMove} title="Move to another section" aria-label="Move to another section" className="p-1.5 hover:text-[#1D4ED8]"><FolderInput className="w-4 h-4" /></button>}
      <button onClick={onEdit} className="p-1.5 hover:text-[#1D4ED8]"><Pencil className="w-4 h-4" /></button>
      <button onClick={onRemove} className="p-1.5 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}