import { connectFirestoreEmulator, getFirestore } from 'firebase/firestore';
import firebaseApp from './firebase';

export const db = getFirestore(firebaseApp);
if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true' &&
  !import.meta.hot?.data.firestoreEmulatorConnected
) {
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  if (import.meta.hot) import.meta.hot.data.firestoreEmulatorConnected = true;
}
