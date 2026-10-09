# History Support (Firebase)

IGCSE and IB History support site by Ms Lowe. React + Vite front end on GitHub Pages; Firebase project `history-support` for data.

## How it fits together

- **Database:** Cloud Firestore. One collection per content type (`ContentBlock`, `PageSection`, `Resource`, ...). Everyone can read.
- **Editing:** the site sends changes with the edit password to the `edit` Cloud Function (`functions/index.js`), which checks it against the `EDIT_PASSWORD` secret. No accounts.
- **Uploads:** Firebase Storage. Teacher uploads go through the `edit` function; student submissions upload directly (10 MB limit).
- **Client code:** `src/api/firebaseClient.js` (reads) and `src/api/editor.js` (edits).

## Run locally

```
npm install
npm run dev
```

## Publish

Pushing to `main` builds and deploys the site to GitHub Pages (`.github/workflows/deploy-pages.yml`).

Back-end changes (rules or the function) are deployed with the Firebase CLI:

```
cd functions && npm install && cd ..
firebase deploy --only functions,firestore:rules,storage
```

Change the edit password:

```
firebase functions:secrets:set EDIT_PASSWORD
firebase deploy --only functions
```

## Copying content from the old Base44 app

```
cd scripts && npm install && node migrate-from-base44.mjs
```
