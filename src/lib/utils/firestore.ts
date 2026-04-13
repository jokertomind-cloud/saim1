import {
  Timestamp,
  addDoc,
  collection,
  deleteDoc,
  documentId,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/client";

export const nowTimestamp = () => serverTimestamp();

export const toDateLabel = (value: unknown) => {
  if (!value) return "-";
  if (value instanceof Timestamp) return value.toDate().toLocaleString("ja-JP");
  if (typeof value === "object" && value !== null && "seconds" in value) {
    return new Date(Number((value as { seconds: number }).seconds) * 1000).toLocaleString("ja-JP");
  }
  return String(value);
};

export const listCollection = async <T>(collectionName: string, field?: string, equal?: string) => {
  const db = getFirebaseDb();
  const base = collection(db, collectionName);
  const q = field ? query(base, where(field, "==", equal)) : query(base);
  const snap = await getDocs(q);
  return snap.docs.map((item) => ({ id: item.id, data: item.data() as T }));
};

export const listOrderedCollection = async <T>(collectionName: string, orderField: string) => {
  const db = getFirebaseDb();
  const snap = await getDocs(query(collection(db, collectionName), orderBy(orderField, "asc")));
  return snap.docs.map((item) => ({ id: item.id, data: item.data() as T }));
};

export const getDocument = async <T>(collectionName: string, id: string) => {
  const db = getFirebaseDb();
  const snap = await getDoc(doc(db, collectionName, id));
  return snap.exists() ? ({ id: snap.id, data: snap.data() as T }) : null;
};

export const getDocumentsByIds = async <T>(collectionName: string, ids: string[]) => {
  const db = getFirebaseDb();
  if (!ids.length) return [] as Array<{ id: string; data: T }>;
  const chunks = Array.from({ length: Math.ceil(ids.length / 10) }, (_, index) => ids.slice(index * 10, index * 10 + 10));
  const results = await Promise.all(
    chunks.map((chunk) => getDocs(query(collection(db, collectionName), where(documentId(), "in", chunk))))
  );
  return results.flatMap((snap) => snap.docs.map((item) => ({ id: item.id, data: item.data() as T })));
};

export const saveDocument = async <T extends object>(collectionName: string, id: string, data: T) => {
  const db = getFirebaseDb();
  await setDoc(doc(db, collectionName, id), { ...data, updatedAt: nowTimestamp() }, { merge: true });
};

export const createDocument = async <T extends object>(collectionName: string, data: T) => {
  const db = getFirebaseDb();
  return addDoc(collection(db, collectionName), {
    ...data,
    createdAt: nowTimestamp(),
    updatedAt: nowTimestamp()
  });
};

export const patchDocument = async <T extends object>(collectionName: string, id: string, data: Partial<T>) => {
  const db = getFirebaseDb();
  await updateDoc(doc(db, collectionName, id), { ...data, updatedAt: nowTimestamp() });
};

export const removeDocument = async (collectionName: string, id: string) => {
  const db = getFirebaseDb();
  await deleteDoc(doc(db, collectionName, id));
};
