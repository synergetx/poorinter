// @vitest-environment node
import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest';

let environment: RulesTestEnvironment;

beforeAll(async () => {
  // This suite must only run through the local Firebase Emulator Suite.
  if (!process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_DATABASE_EMULATOR_HOST) {
    throw new Error('Run the rules suite with Firebase emulators: yarn test:rules');
  }

  environment = await initializeTestEnvironment({
    projectId: 'demo-poorinter',
    firestore: { rules: await readFile('firebase/firestore.rules', 'utf8') },
    database: { rules: await readFile('firebase/database.rules.json', 'utf8') },
  });
});

afterEach(async () => {
  if (environment) {
    await environment.clearFirestore();
    await environment.clearDatabase();
  }
});

afterAll(async () => {
  await environment?.cleanup();
});

it('allows signed-in letter editing and rejects anonymous or malformed writes', async () => {
  const anonymous = environment.unauthenticatedContext().firestore().doc('letters/A');
  const editor = environment.authenticatedContext('editor').firestore().doc('letters/A');

  await assertFails(anonymous.get());
  await assertFails(anonymous.set({ code: 'G0 X0 Y0' }));
  await assertSucceeds(editor.set({ code: 'G0 X0 Y0' }));
  expect((await assertSucceeds(editor.get())).data()).toEqual({ code: 'G0 X0 Y0' });
  await assertSucceeds(editor.set({ code: 'G1 X10 Y10' }));
  for (const invalid of [
    { code: '' },
    { code: 123 },
    { code: 'x'.repeat(100001) },
    { code: 'G0', admin: true },
  ]) {
    await assertFails(editor.set(invalid));
  }
});

it('requires an existing administrator to change Realtime Database admin records', async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    await context.database().ref('admins/admin').set(true);
  });

  await assertFails(environment.unauthenticatedContext().database().ref('admins/target').set(true));
  await assertFails(
    environment.authenticatedContext('editor').database().ref('admins/editor').set(true),
  );
  await assertSucceeds(
    environment.authenticatedContext('admin').database().ref('admins/target').set(true),
  );
});
