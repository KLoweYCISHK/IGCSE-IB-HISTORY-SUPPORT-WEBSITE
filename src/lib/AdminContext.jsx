import React, { createContext, useContext, useState } from 'react';
import { checkEditPassword, getEditPassword, setEditPassword } from '@/api/editor';

const AdminContext = createContext({ isAdmin: false, editMode: false });

// "isAdmin" means this browser has unlocked editing with the edit password
// (checked on the server). No account is needed.
export function AdminProvider({ children }) {
  const [unlocked, setUnlocked] = useState(!!getEditPassword());
  const [editMode, setEditMode] = useState(!!getEditPassword());

  const unlock = async (password) => {
    const ok = await checkEditPassword(password);
    if (ok) { setEditPassword(password); setUnlocked(true); setEditMode(true); }
    return ok;
  };

  const lock = () => { setEditPassword(''); setUnlocked(false); setEditMode(false); };

  return (
    <AdminContext.Provider
      value={{
        user: null, // no accounts: students contribute anonymously
        loading: false,
        isAdmin: unlocked,
        editMode: unlocked && editMode,
        setEditMode,
        unlock,
        lock,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export const useAdmin = () => useContext(AdminContext);
