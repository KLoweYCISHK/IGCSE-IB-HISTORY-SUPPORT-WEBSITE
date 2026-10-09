// Password-protected editing.
// The edit password lives in the secret EDIT_PASSWORD (set with
// `firebase functions:secrets:set EDIT_PASSWORD`), never in the code.
// Anyone who sends the right password can change site content; everyone else is read-only.
const crypto = require('crypto');
const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();
const EDIT_PASSWORD = defineSecret('EDIT_PASSWORD');

const ENTITIES = new Set([
  'ContentBlock', 'Document', 'ExamItem', 'IgcseFocusUnit', 'IgcseMarkSchemeTemplate',
  'IgcsePaper2Focus', 'IgcsePaper2Link', 'PageMeta', 'PageSection', 'Perspective',
  'ChecklistItem', 'Resource', 'RoadmapStep', 'SiteSettings', 'Textbook',
]);

function passwordOk(given) {
  const expected = EDIT_PASSWORD.value();
  if (!expected || typeof given !== 'string' || !given) return false;
  const a = crypto.createHash('sha256').update(given).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  return crypto.timingSafeEqual(a, b);
}

const now = () => new Date().toISOString();
const strip = ({ id, ...data }) => data; // eslint-disable-line no-unused-vars

async function findMatching(col, query) {
  let ref = col;
  for (const [k, v] of Object.entries(query || {})) {
    if (typeof v === 'string' && v !== '') ref = ref.where(k, '==', v);
  }
  const snap = await ref.get();
  return snap.docs.filter((d) =>
    Object.entries(query || {}).every(([k, v]) => (d.get(k) ?? null) === (v ?? null)));
}

async function inBatches(items, apply) {
  for (let i = 0; i < items.length; i += 400) {
    const batch = db.batch();
    items.slice(i, i + 400).forEach((item) => apply(batch, item));
    await batch.commit();
  }
}

const methods = {
  async create(col, data) {
    const payload = { ...strip(data || {}), created_date: now(), updated_date: now() };
    const ref = await col.add(payload);
    return { id: ref.id, ...payload };
  },
  async update(col, id, data) {
    const payload = { ...strip(data || {}), updated_date: now() };
    await col.doc(String(id)).update(payload);
    return { id, ...payload };
  },
  async delete(col, id) {
    await col.doc(String(id)).delete();
    return { success: true };
  },
  async bulkCreate(col, list) {
    const out = [];
    await inBatches(list || [], (batch, data) => {
      const ref = col.doc();
      const payload = { ...strip(data), created_date: now(), updated_date: now() };
      batch.set(ref, payload);
      out.push({ id: ref.id, ...payload });
    });
    return out;
  },
  async bulkUpdate(col, list) {
    await inBatches((list || []).filter((r) => r && r.id), (batch, rec) =>
      batch.update(col.doc(String(rec.id)), { ...strip(rec), updated_date: now() }));
    return { success: true };
  },
  async updateMany(col, query, update) {
    const data = (update && update.$set) || update || {};
    const docs = await findMatching(col, query);
    await inBatches(docs, (batch, d) => batch.update(d.ref, { ...data, updated_date: now() }));
    return { updated: docs.length };
  },
  async deleteMany(col, query) {
    if (!query || !Object.keys(query).length) throw new Error('deleteMany needs a filter');
    const docs = await findMatching(col, query);
    await inBatches(docs, (batch, d) => batch.delete(d.ref));
    return { deleted: docs.length };
  },
};

async function upload(file) {
  if (!file || typeof file.data !== 'string' || !file.name) throw new Error('No file');
  const buffer = Buffer.from(file.data, 'base64');
  const safe = String(file.name).replace(/[^\w.-]+/g, '_');
  const path = `uploads/${Date.now()}_${crypto.randomBytes(4).toString('hex')}_${safe}`;
  const token = crypto.randomUUID();
  const bucket = admin.storage().bucket();
  await bucket.file(path).save(buffer, {
    resumable: false,
    metadata: {
      contentType: file.type || 'application/octet-stream',
      cacheControl: 'public, max-age=31536000',
      metadata: { firebaseStorageDownloadTokens: token },
    },
  });
  return {
    file_url: `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(path)}?alt=media&token=${token}`,
  };
}

exports.edit = onRequest(
  { region: 'asia-east1', cors: true, invoker: 'public', secrets: [EDIT_PASSWORD], memory: '512MiB', maxInstances: 5 },
  async (req, res) => {
    try {
      if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
      const { password, action, entity, method, args, file } = req.body || {};
      if (!passwordOk(password)) {
        await new Promise((r) => setTimeout(r, 800));
        return res.status(403).json({ error: 'Incorrect password' });
      }
      if (action === 'check') return res.json({ ok: true });
      if (action === 'upload') return res.json(await upload(file));

      if (!ENTITIES.has(entity) || !Object.hasOwn(methods, method) || !Array.isArray(args)) {
        return res.status(400).json({ error: 'Not allowed' });
      }
      const result = await methods[method](db.collection(entity), ...args);
      return res.json({ result: result ?? null });
    } catch (error) {
      return res.status(500).json({ error: error.message || 'Edit failed' });
    }
  },
);
