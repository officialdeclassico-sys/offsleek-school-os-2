import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyA6zoCd_YOePbKUF0YQc4HHSx68_0dKtXE",
  authDomain: "offsleek-shared-backend.firebaseapp.com",
  projectId: "offsleek-shared-backend",
  storageBucket: "offsleek-shared-backend.firebasestorage.app",
  messagingSenderId: "982793510619",
  appId: "1:982793510619:web:1189cb05dbf1903449b6fe"
};

export const app: FirebaseApp = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
