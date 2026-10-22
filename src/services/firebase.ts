import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from 'firebase/auth';
import { getFirestore, doc, setDoc, onSnapshot, Firestore } from 'firebase/firestore';

const FIREBASE_CONFIG = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

export function isFirebaseConfigured(): boolean {
  return Boolean(
    FIREBASE_CONFIG.apiKey &&
    FIREBASE_CONFIG.authDomain &&
    FIREBASE_CONFIG.projectId
  );
}

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

function getApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(FIREBASE_CONFIG);
  }
  return app;
}

function getDb(): Firestore {
  if (!db) {
    db = getFirestore(getApp());
  }
  return db;
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

export function getFirebaseAuth() {
  return getAuth(getApp());
}

export function getGoogleProvider() {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  return provider;
}

export async function signInWithGoogle(): Promise<User> {
  const auth = getFirebaseAuth();
  const provider = getGoogleProvider();
  const result = await signInWithPopup(auth, provider);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  const auth = getFirebaseAuth();
  await signOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  const auth = getFirebaseAuth();
  return onAuthStateChanged(auth, callback);
}

// ─── FIRESTORE CLOUD DATABASE ─────────────────────────────────────────────────

export async function saveScheduleToCloud(uid: string, data: object): Promise<void> {
  try {
    const firestore = getDb();
    const userDocRef = doc(firestore, 'schedules', uid);
    await setDoc(userDocRef, data, { merge: true });
  } catch (err) {
    console.warn('Failed to save to cloud (check Firestore rules/setup):', err);
  }
}

export function subscribeToSchedule(
  uid: string,
  callback: (data: any) => void
): () => void {
  try {
    const firestore = getDb();
    const userDocRef = doc(firestore, 'schedules', uid);
    return onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          callback(docSnap.data());
        }
      },
      (err) => {
        console.warn('Firestore subscription error (check Firestore rules/setup):', err);
      }
    );
  } catch (err) {
    console.warn('Could not initialize Firestore listener:', err);
    return () => {};
  }
}
