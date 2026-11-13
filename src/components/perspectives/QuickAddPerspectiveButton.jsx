import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useAdmin } from '@/lib/AdminContext';
import AddPerspectiveDialog from './AddPerspectiveDialog';

export default function QuickAddPerspectiveButton() {
  const { user } = useAdmin();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        className="h-11 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white"
        onClick={() => setOpen(true)}
      >
        <Plus className="w-4 h-4 mr-1.5" /> Quick add a perspective
      </Button>
      <AddPerspectiveDialog
        open={open}
        onOpenChange={setOpen}
        initial={{ student_name: user?.full_name || '' }}
        onSaved={() => setOpen(false)}
      />
    </>
  );
}