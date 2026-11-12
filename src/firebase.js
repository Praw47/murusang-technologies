import { initializeApp } from 'firebase/app';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

const hasFirebaseConfig = Object.values(firebaseConfig).every((value) => typeof value === 'string' && value.trim().length > 0);

export const ADMIN_EMAIL = 'kdprawin@gmail.com';

export const firebaseApp = hasFirebaseConfig ? initializeApp(firebaseConfig) : null;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;
export const db = firebaseApp ? getFirestore(firebaseApp) : null;
export const isFirebaseConfigured = Boolean(firebaseApp);

export const isAdminUser = (user) =>
  !!user &&
  user.emailVerified === true &&
  user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

export const watchAuthState = (callback) => {
  if (!auth) {
    callback(null);
    return () => {};
  }

  return onAuthStateChanged(auth, callback);
};

export const loginWithEmailPassword = (email, password) => {
  if (!auth) {
    return Promise.reject(new Error('Firebase is not configured. Add the project config to the Vite env variables.'));
  }

  return signInWithEmailAndPassword(auth, email, password);
};

export const signOutUser = () => {
  if (!auth) {
    return Promise.resolve();
  }

  return signOut(auth);
};

export const subscribePublishedContent = (onContent, onError) => {
  if (!db) {
    onError(new Error('Firebase is not configured.'));
    return () => {};
  }

  return onSnapshot(
    doc(db, 'siteContent', 'published'),
    (snapshot) => {
      if (snapshot.exists()) {
        onContent(snapshot.data());
      }
    },
    onError,
  );
};

export const savePublishedContent = async (content) => {
  if (!db) {
    throw new Error('Firebase is not configured.');
  }

  await setDoc(
    doc(db, 'siteContent', 'published'),
    { ...content, updatedAt: serverTimestamp() },
    { merge: true },
  );
};

export const createLead = async (lead) => {
  if (!db) {
    throw new Error('Firebase is not configured.');
  }

  return addDoc(collection(db, 'leads'), {
    name: lead.name.trim(),
    email: lead.email.trim().toLowerCase(),
    phone: lead.phone.trim(),
    businessName: lead.businessName.trim(),
    serviceCategory: lead.serviceCategory.trim(),
    budget: lead.budget.trim(),
    projectDescription: lead.projectDescription.trim(),
    expectedDeliveryDate: lead.expectedDeliveryDate.trim(),
    createdAt: serverTimestamp(),
  });
};

export const subscribeLeads = (onLeads, onError) => {
  if (!db) {
    onError(new Error('Firebase is not configured.'));
    return () => {};
  }

  const leadsQuery = query(collection(db, 'leads'), orderBy('createdAt', 'desc'), limit(50));
  return onSnapshot(
    leadsQuery,
    (snapshot) => {
      onLeads(snapshot.docs.map((leadDoc) => ({ id: leadDoc.id, ...leadDoc.data() })));
    },
    onError,
  );
};
