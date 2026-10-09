// One-off: copies all site content from the Base44 app into Firestore.
// Run in Google Cloud Shell (already signed in as the project owner):
//   cd scripts && npm install && node migrate-from-base44.mjs
// Safe to re-run: records keep their Base44 ids, so nothing is duplicated.
import { createClient } from '@base44/sdk';
import admin from 'firebase-admin';

const APP_ID = '6a9374897e9609e0d36beee4';
const ENTITIES = [
  'ContentBlock', 'Document', 'ExamItem', 'IgcseFocusUnit', 'IgcseMarkSchemeTemplate',
  'IgcsePaper2Focus', 'IgcsePaper2Link', 'PageMeta', 'PageSection', 'Perspective',
  'ChecklistItem', 'Resource', 'RoadmapStep', 'SiteSettings', 'Textbook',
];

const base44 = createClient({ appId: APP_ID, serverUrl: 'https://base44.app', requiresAuth: false });
admin.initializeApp({ projectId: 'history-support' });
const db = admin.firestore();
db.settings({ ignoreUndefinedProperties: true });

async function fetchAll(name) {
  const seen = new Map();
  for (let skip = 0; ; skip += 500) {
    const page = await base44.entities[name].list('created_date', 500, skip);
    if (!Array.isArray(page) || !page.length) break;
    const before = seen.size;
    page.forEach((r) => seen.set(r.id, r));
    if (page.length < 500 || seen.size === before) break;
  }
  return [...seen.values()];
}

let total = 0;
for (const name of ENTITIES) {
  const records = await fetchAll(name);
  for (let i = 0; i < records.length; i += 400) {
    const batch = db.batch();
    for (const { id, ...data } of records.slice(i, i + 400)) batch.set(db.collection(name).doc(String(id)), data);
    await batch.commit();
  }
  total += records.length;
  console.log(`${name}: ${records.length}`);
}
console.log(`Done: ${total} records copied.`);
