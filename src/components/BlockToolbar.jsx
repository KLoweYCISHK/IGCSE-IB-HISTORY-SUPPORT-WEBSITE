import React from 'react';
import { Pencil, Trash2, GripVertical } from 'lucide-react';

export default function BlockToolbar({ dragHandleProps, onEdit, onRemove }) {
  return (
    <div className="absolute -top-3 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-card border border-border rounded px-1 py-1">
      <span
        {...dragHandleProps}
        title="Drag to reorder or move section"
        className="p-1.5 cursor-grab active:cursor-grabbing text-muted-foreground hover:text-[#6F551A]"
      >
        <GripVertical className="w-4 h-4" />
      </span>
      <button onClick={onEdit} className="p-1.5 hover:text-[#6F551A]"><Pencil className="w-4 h-4" /></button>
      <button onClick={onRemove} className="p-1.5 hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
    </div>
  );
}