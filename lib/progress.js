// Student progress, kept in this browser only (no accounts).
// Shape: { revised: {id: true}, saved: {id: true}, known: {id: true}, last: {path, label, track} }
import { useSyncExternalStore } from 'react';

const KEY = 'history-support-progress-v1';
const EVENT = 'history-progress';
const EMPTY = { revised: {}, saved: {}, known: {}, last: null };

let cache = null;

function read() {
  if (cache) return cache;
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || 'null');
    cache = { ...EMPTY, ...(raw && typeof raw === 'object' ? raw : {}) };
  } catch {
    cache = { ...EMPTY };
  }
  return cache;
}

function write(next) {
  cache = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* private mode: keep in memory */ }
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb) {
  const onStorage = (e) => { if (e.key === KEY) { cache = null; cb(); } };
  window.addEventListener(EVENT, cb);
  window.addEventListener('storage', onStorage);
  return () => { window.removeEventListener(EVENT, cb); window.removeEventListener('storage', onStorage); };
}

export function toggle(group, id) {
  const p = read();
  const set = { ...(p[group] || {}) };
  if (set[id]) delete set[id]; else set[id] = true;
  write({ ...p, [group]: set });
}

export function setFlag(group, id, on) {
  const p = read();
  const set = { ...(p[group] || {}) };
  if (on) set[id] = true; else delete set[id];
  write({ ...p, [group]: set });
}

export function setLast(last) {
  const p = read();
  if (p.last?.path === last.path && p.last?.track === last.track) return;
  write({ ...p, last });
}

export function useProgress() {
  return useSyncExternalStore(subscribe, read, read);
}

// A short code students can copy to another device.
export function exportCode() {
  const { revised, saved, known } = read();
  const json = JSON.stringify({ r: Object.keys(revised), s: Object.keys(saved), k: Object.keys(known) });
  return btoa(unescape(encodeURIComponent(json)));
}

// Merges a code from another device into this one. Returns false if the code is not valid.
export function importCode(code) {
  try {
    const data = JSON.parse(decodeURIComponent(escape(atob(String(code).trim()))));
    const ids = (list) => (Array.isArray(list) ? list.filter((x) => typeof x === 'string' && x.length < 200).slice(0, 5000) : []);
    const p = read();
    const merge = (group, list) => ({ ...p[group], ...Object.fromEntries(ids(list).map((id) => [id, true])) });
    write({ ...p, revised: merge('revised', data.r), saved: merge('saved', data.s), known: merge('known', data.k) });
    return true;
  } catch {
    return false;
  }
}
