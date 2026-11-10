import { getApp, getApps, initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

const existingApp = getApps().length > 0;
const firebaseApp = existingApp
  ? getApp()
  : initializeApp({
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyCCRjaqd3RM4zqJ0QvEURnbNk1vruDJ4us',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'poop-rinter.firebaseapp.com',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'poop-rinter',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'poop-rinter.appspot.com',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '1026480113680',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:1026480113680:web:8ffefde4ed05b3cb2d2295',
    });
export const auth = getAuth(firebaseApp);

if (!existingApp && import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATORS === 'true') {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099');
}
export default firebaseApp;
