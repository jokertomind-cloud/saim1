import assert from "node:assert/strict";
import admin from "firebase-admin";
import { runHostedBootstrap } from "../src/lib/services/setup-service";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || "demo-pixel-learning-map-test";
process.env.APP_SETUP_TOKEN = process.env.APP_SETUP_TOKEN || "setup-secret-12345";
process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = projectId;

const app = admin.apps[0] || admin.initializeApp({ projectId });
const db = admin.firestore(app);
const auth = admin.auth(app);

const collectionsToReset = [
  "avatars",
  "maps",
  "mapPoints",
  "videos",
  "quizzes",
  "quizQuestions",
  "appConfig",
  "users",
  "userProgress",
  "userVideoStats",
  "userQuizResults"
] as const;

const clearCollection = async (collectionName: (typeof collectionsToReset)[number]) => {
  const snapshot = await db.collection(collectionName).get();
  await Promise.all(snapshot.docs.map((document) => document.ref.delete()));
};

const clearAuthUsers = async () => {
  let nextPageToken: string | undefined;

  do {
    const batch = await auth.listUsers(1000, nextPageToken);
    await Promise.all(batch.users.map((user) => auth.deleteUser(user.uid)));
    nextPageToken = batch.pageToken;
  } while (nextPageToken);
};

const main = async () => {
  await clearAuthUsers();
  for (const collectionName of collectionsToReset) {
    await clearCollection(collectionName);
  }

  const result = await runHostedBootstrap({
    setupToken: process.env.APP_SETUP_TOKEN ?? "setup-secret-12345",
    displayName: "初回管理者",
    gender: "other",
    avatarId: "avatar-neutral-01",
    email: "bootstrap-admin@example.com",
    password: "Password123!"
  });

  const userRecord = await auth.getUser(result.uid);
  const profile = await db.collection("users").doc(result.uid).get();
  const progress = await db.collection("userProgress").doc(result.uid).get();
  const video = await db.collection("videos").doc("video-1").get();
  const setupDoc = await db.collection("appConfig").doc("setup").get();

  assert.equal(userRecord.email, "bootstrap-admin@example.com");
  assert.equal(userRecord.customClaims?.admin, true);
  assert.equal(profile.exists, true);
  assert.equal(profile.data()?.role, "admin");
  assert.equal(progress.exists, true);
  assert.deepEqual(progress.data()?.unlockedVideoIds, ["video-1"]);
  assert.equal(video.exists, true);
  assert.equal(setupDoc.exists, true);

  await assert.rejects(
    () =>
      runHostedBootstrap({
        setupToken: process.env.APP_SETUP_TOKEN ?? "setup-secret-12345",
        displayName: "再実行管理者",
        gender: "other",
        avatarId: "avatar-neutral-01",
        email: "second-admin@example.com",
        password: "Password123!"
      }),
    /初回セットアップはすでに完了しています/
  );

  console.log("Hosted bootstrap tests passed.");
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
