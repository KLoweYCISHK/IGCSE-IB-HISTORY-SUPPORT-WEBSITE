// Writes go through the password-checked "edit" Cloud Function, so anyone
// with the edit password can change content without an account.
import { store } from '@/api/firebaseClient';

const KEY = 'history_edit_password';
const EDIT_URL = import.meta.env.VITE_EDIT_FUNCTION_URL
  || 'https://asia-east1-history-support.cloudfunctions.net/edit';

export function getEditPassword() {
  try { return sessionStorage.getItem(KEY) || ''; } catch { return ''; }
}
export function setEditPassword(pw) {
  try { pw ? sessionStorage.setItem(KEY, pw) : sessionStorage.removeItem(KEY); } catch { /* ignore */ }
}

async function post(body) {
  const res = await fetch(EDIT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Edit failed');
  return data;
}

// Returns true if the server accepts the password.
export async function checkEditPassword(password) {
  try {
    const data = await post({ password, action: 'check' });
    return !!data.ok;
  } catch {
    return false;
  }
}

async function call(entity, method, args) {
  try {
    const data = await post({ password: getEditPassword(), entity, method, args });
    return data.result;
  } catch (err) {
    alert(`Couldn't save: ${err?.message || 'Edit failed'}`);
    throw err;
  }
}

const METHODS = ['create', 'update', 'delete', 'bulkCreate', 'bulkUpdate', 'updateMany', 'deleteMany'];

// Usage mirrors store.entities: editDb.ContentBlock.update(id, data)
export const editDb = new Proxy({}, {
  get: (_, entity) => Object.fromEntries(
    METHODS.map((m) => [m, (...args) => call(String(entity), m, args)])
  ),
});

const toBase64 = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
  reader.onerror = () => reject(reader.error);
  reader.readAsDataURL(file);
});

// uploadFile({ file }) → { file_url }
// Without the edit password (e.g. a student submission) it uses the public upload.
export async function uploadFile({ file }) {
  if (!getEditPassword()) return store.integrations.Core.UploadFile({ file });
  try {
    if (file.size > 20 * 1024 * 1024) throw new Error('File is larger than 20 MB');
    return await post({
      password: getEditPassword(),
      action: 'upload',
      file: { name: file.name, type: file.type, data: await toBase64(file) },
    });
  } catch (err) {
    alert(`Couldn't upload: ${err?.message || 'Upload failed'}`);
    throw err;
  }
}
