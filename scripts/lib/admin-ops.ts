import admin from "firebase-admin";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  throw new Error("FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY を設定してください。");
}

export const adminApp =
  admin.apps[0] ||
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey
    }),
    projectId
  });

export const adminAuth = admin.auth(adminApp);
export const adminDb = admin.firestore(adminApp);

export const parseCliArg = (name: string) => {
  const pair = process.argv.find((arg) => arg.startsWith(`--${name}=`));
  return pair ? pair.slice(name.length + 3) : "";
};

export const resolveTargetUid = async (uid: string, email: string) => {
  if (uid) {
    return uid;
  }

  if (!email) {
    throw new Error("--uid=<uid> または --email=<email> のどちらかを指定してください。");
  }

  const userRecord = await adminAuth.getUserByEmail(email);
  return userRecord.uid;
};

export const setAdminClaim = async (uid: string, enabled: boolean) => {
  const userRecord = await adminAuth.getUser(uid);
  const currentClaims = (userRecord.customClaims ?? {}) as Record<string, unknown>;

  if (enabled) {
    await adminAuth.setCustomUserClaims(uid, {
      ...currentClaims,
      admin: true
    });
    return;
  }

  const { admin: _admin, ...rest } = currentClaims;
  await adminAuth.setCustomUserClaims(uid, Object.keys(rest).length > 0 ? rest : null);
};

export const syncFirestoreRole = async (uid: string, role: "admin" | "user") => {
  await adminDb.collection("users").doc(uid).set(
    {
      role,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );
};
