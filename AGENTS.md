# AGENTS.md

React + Vite site backed by Firebase (project `history-support`). Start with `README.md`.

- `src/api/firebaseClient.js`: Firestore reads and public submissions (`store.entities.<Name>`).
- `src/api/editor.js`: password-checked edits and uploads via the `edit` Cloud Function.
- `functions/index.js`: the `edit` Cloud Function. The password is the `EDIT_PASSWORD` secret; never commit it.
- `firestore.rules`, `storage.rules`: access rules.
- Run `npm run lint` and `npm run build` before finishing code changes.
