// Firebase backend for the site (replaces the Base44 SDK).
// `store.entities.<Name>` mirrors the old API: list / filter / get / create / update / delete.
// Reads are public. Content edits go through the password-checked "edit"
// Cloud Function (see src/api/editor.js); only student submissions write directly.
import { initializeApp } from 'firebase/app';
import {
  getFirestore, collection, doc, getDocs, getDoc, addDoc, updateDoc, deleteDoc,
  query as fsQuery, where,
} from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Safe to publish: access is controlled by firestore.rules / storage.rules.
const firebaseConfig = {
  apiKey: 'AIzaSyAD5rnALgZ7VfMkSbYPnkffuTjss8SmKng',
  authDomain: 'history-support.firebaseapp.com',
  projectId: 'history-support',
  storageBucket: 'history-support.firebasestorage.app',
  messagingSenderId: '375798556293',
  appId: '1:375798556293:web:04275a93cb2b9482fa6bec',
};

export const firebaseApp = initializeApp(firebaseConfig);
const firestore = getFirestore(firebaseApp);
const storage = getStorage(firebaseApp);

const toRecord = (snap) => ({ id: snap.id, ...snap.data() });

// undefined values are ignored, as they were when queries were sent as JSON
const matches = (rec, q) =>
  Object.entries(q || {}).every(([k, v]) => v === undefined || (rec[k] ?? null) === v);

// sort is a field name, with a leading "-" for descending (e.g. "-created_date")
function sortRecords(list, sort) {
  if (!sort) return list;
  const desc = sort.startsWith('-');
  const field = sort.replace(/^[-+]/, '');
  return [...list].sort((a, b) => {
    const x = a[field], y = b[field];
    if (x == null && y == null) return 0;
    if (x == null) return 1;
    if (y == null) return -1;
    const cmp = x < y ? -1 : x > y ? 1 : 0;
    return desc ? -cmp : cmp;
  });
}

function entity(name) {
  const col = collection(firestore, name);
  const filter = async (q = {}, sort = '', limit = 0) => {
    // Text fields are narrowed on the server; everything is re-checked here so
    // booleans and missing fields behave as they did before.
    const clauses = Object.entries(q)
      .filter(([, v]) => typeof v === 'string' && v !== '')
      .map(([k, v]) => where(k, '==', v));
    const snap = await getDocs(clauses.length ? fsQuery(col, ...clauses) : col);
    const list = sortRecords(snap.docs.map(toRecord).filter((r) => matches(r, q)), sort);
    return limit ? list.slice(0, limit) : list;
  };
  return {
    filter,
    list: (sort = '', limit = 0) => filter({}, sort, limit),
    get: async (id) => {
      const snap = await getDoc(doc(col, id));
      if (!snap.exists()) throw new Error(`${name} ${id} not found`);
      return toRecord(snap);
    },
    create: async (data) => {
      const now = new Date().toISOString();
      const payload = { ...data, created_date: now, updated_date: now };
      const created = await addDoc(col, payload);
      return { id: created.id, ...payload };
    },
    update: async (id, data) => {
      const payload = { ...data, updated_date: new Date().toISOString() };
      await updateDoc(doc(col, id), payload);
      return { id, ...payload };
    },
    delete: async (id) => { await deleteDoc(doc(col, id)); },
  };
}

// Public upload used for student submissions (10 MB limit, see storage.rules).
async function uploadPublicFile({ file }) {
  const safe = file.name.replace(/[^\w.-]+/g, '_');
  const path = `submissions/${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${safe}`;
  const fileRef = ref(storage, path);
  await uploadBytes(fileRef, file, { contentType: file.type || undefined });
  return { file_url: await getDownloadURL(fileRef) };
}

export const store = {
  entities: new Proxy({}, { get: (cache, name) => (cache[name] ??= entity(String(name))) }),
  integrations: { Core: { UploadFile: uploadPublicFile } },
};
