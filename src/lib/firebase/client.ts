"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { connectAuthEmulator, getAuth, type Auth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore, type Firestore } from "firebase/firestore";

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
let authEmulatorConnected = false;
let firestoreEmulatorConnected = false;

const shouldUseEmulators = process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATORS === "true";
const authEmulatorUrl = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_URL;
const firestoreEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_HOST;
const firestoreEmulatorPort = Number(process.env.NEXT_PUBLIC_FIREBASE_FIRESTORE_EMULATOR_PORT ?? "0");

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
    if (typeof window !== "undefined" && shouldUseEmulators && authEmulatorUrl && !authEmulatorConnected) {
      connectAuthEmulator(firebaseAuth, authEmulatorUrl, { disableWarnings: true });
      authEmulatorConnected = true;
    }
  }
  return firebaseAuth;
};

export const getFirebaseDb = () => {
  if (!firestoreDb) {
    firestoreDb = getFirestore(getFirebaseApp());
    if (
      typeof window !== "undefined" &&
      shouldUseEmulators &&
      firestoreEmulatorHost &&
      Number.isInteger(firestoreEmulatorPort) &&
      firestoreEmulatorPort > 0 &&
      !firestoreEmulatorConnected
    ) {
      connectFirestoreEmulator(firestoreDb, firestoreEmulatorHost, firestoreEmulatorPort);
      firestoreEmulatorConnected = true;
    }
  }
  return firestoreDb;
};
