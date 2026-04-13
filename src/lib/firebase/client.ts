"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;
let firestoreDb: Firestore | null = null;

const assertFirebaseConfig = () => {
  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    throw new Error("Firebase configuration is missing. Check .env.local values.");
  }
};

export const getFirebaseApp = () => {
  assertFirebaseConfig();
  if (!firebaseApp) {
    firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return firebaseApp;
};

export const getFirebaseAuth = () => {
  if (!firebaseAuth) {
    firebaseAuth = getAuth(getFirebaseApp());
  }
  return firebaseAuth;
};

export const getFirebaseDb = () => {
  if (!firestoreDb) {
    firestoreDb = getFirestore(getFirebaseApp());
  }
  return firestoreDb;
};
