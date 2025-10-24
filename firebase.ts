// FIX: Manually define types for import.meta.env as the vite/client types reference was failing.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_FIREBASE_API_KEY: string;
      readonly VITE_FIREBASE_AUTH_DOMAIN: string;
      readonly VITE_FIREBASE_PROJECT_ID: string;
      readonly VITE_FIREBASE_STORAGE_BUCKET: string;
      readonly VITE_FIREBASE_MESSAGING_SENDER_ID: string;
      readonly VITE_FIREBASE_APP_ID: string;
    }
  }
}

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';

// FIX: Safely access environment variables to prevent crashes in environments where `import.meta.env` is not defined.
// FIX: Explicitly typed `env` to resolve TypeScript errors when `import.meta.env` is not available.
const env: Partial<ImportMeta['env']> = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};

// Your web app's Firebase configuration
// These variables are populated by Vercel from your project's environment variables
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let firebaseInitialized = false;

// Check if essential config is present before initializing
if (firebaseConfig.apiKey && firebaseConfig.projectId) {
  try {
    app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    firebaseInitialized = true;
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    // Keep db as null and firebaseInitialized as false
  }
} else {
  console.warn("Firebase configuration is missing. The app will run in local demo mode.");
}

export { db, firebaseInitialized };
