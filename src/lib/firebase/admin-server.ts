import { applicationDefault, cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID ?? process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? process.env.GCLOUD_PROJECT;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

const hasServiceAccountCredentials = Boolean(projectId && clientEmail && privateKey);
const usingEmulators = Boolean(process.env.FIREBASE_AUTH_EMULATOR_HOST || process.env.FIRESTORE_EMULATOR_HOST);

const getAdminApp = () => {
  if (getApps().length) {
    return getApp();
  }

  if (hasServiceAccountCredentials && projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey
      }),
      projectId
    });
  }

  if (usingEmulators) {
    return initializeApp({
      projectId: projectId ?? "demo-pixel-learning-map-test"
    });
  }

  return initializeApp({
    credential: applicationDefault(),
    projectId
  });
};

export const getServerAdminAuth = () => getAuth(getAdminApp());
export const getServerAdminDb = () => getFirestore(getAdminApp());
export const serverTimestamp = () => FieldValue.serverTimestamp();
