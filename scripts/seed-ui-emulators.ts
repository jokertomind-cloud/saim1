import admin from "firebase-admin";
import { fileURLToPath } from "node:url";
import { seedData } from "../firebase/seed/seed-data";
import type { UserProfile, UserProgress, UserQuizResult, UserVideoStat } from "../src/types/models";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || "demo-pixel-learning-map-test";

const app = admin.apps[0] || admin.initializeApp({ projectId });
const db = admin.firestore(app);
const auth = admin.auth(app);
const timestamp = admin.firestore.FieldValue.serverTimestamp();

const collectionsToReset = [
  "avatars",
  "maps",
  "mapPoints",
  "videos",
  "quizzes",
  "quizQuestions",
  "users",
  "userProgress",
  "userVideoStats",
  "userQuizResults"
] as const;

const clearCollection = async (collectionName: (typeof collectionsToReset)[number]) => {
  const snapshot = await db.collection(collectionName).get();
  await Promise.all(snapshot.docs.map((doc) => doc.ref.delete()));
};

const clearAuthUsers = async () => {
  let nextPageToken: string | undefined;

  do {
    const batch = await auth.listUsers(1000, nextPageToken);
    await Promise.all(batch.users.map((user) => auth.deleteUser(user.uid)));
    nextPageToken = batch.pageToken;
  } while (nextPageToken);
};

const seedMasterCollections = async () => {
  for (const collectionName of [
    "avatars",
    "maps",
    "mapPoints",
    "videos",
    "quizzes",
    "quizQuestions"
  ] as const) {
    const entries = Object.entries(seedData[collectionName]);
    for (const [id, data] of entries) {
      await db.collection(collectionName).doc(id).set(
        {
          ...data,
          createdAt: timestamp,
          updatedAt: timestamp
        },
        { merge: true }
      );
    }
  }
};

const saveUserBundle = async ({
  uid,
  email,
  profile,
  progress,
  videoStats = [],
  quizResults = []
}: {
  uid: string;
  email: string;
  profile: Omit<UserProfile, "email">;
  progress: UserProgress;
  videoStats?: UserVideoStat[];
  quizResults?: UserQuizResult[];
}) => {
  await db.collection("users").doc(uid).set({
    ...profile,
    email,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastLoginAt: timestamp
  });

  await db.collection("userProgress").doc(uid).set({
    ...progress,
    createdAt: timestamp,
    updatedAt: timestamp
  });

  for (const stat of videoStats) {
    await db.collection("userVideoStats").doc(`${uid}_${stat.videoId}`).set({
      ...stat,
      createdAt: timestamp,
      updatedAt: timestamp
    });
  }

  for (const result of quizResults) {
    await db.collection("userQuizResults").doc(`${uid}_${result.quizId}`).set({
      ...result,
      createdAt: timestamp,
      updatedAt: timestamp
    });
  }
};

export const seedUiEmulators = async () => {
  await clearAuthUsers();
  for (const collectionName of collectionsToReset) {
    await clearCollection(collectionName);
  }

  await seedMasterCollections();

  await auth.createUser({
    uid: "admin-user",
    email: "admin@example.com",
    password: "Password123!",
    displayName: "管理者"
  });

  await saveUserBundle({
    uid: "admin-user",
    email: "admin@example.com",
    profile: {
      displayName: "管理者",
      gender: "other",
      avatarId: "avatar-neutral-01",
      role: "admin"
    },
    progress: {
      currentLevel: 1,
      unlockedVideoIds: ["video-1"],
      completedVideoIds: [],
      passedQuizIds: [],
      discoveredPointIds: [],
      currentMapId: "main-map",
      playerPosition: { mapId: "main-map", x: 0, y: 0 }
    }
  });

  await auth.createUser({
    uid: "seed-user",
    email: "learner@example.com",
    password: "Password123!",
    displayName: "サンプル学習者"
  });

  await saveUserBundle({
    uid: "seed-user",
    email: "learner@example.com",
    profile: {
      displayName: "サンプル学習者",
      gender: "other",
      avatarId: "avatar-boy-01",
      role: "user"
    },
    progress: {
      currentLevel: 2,
      unlockedVideoIds: ["video-1", "video-2"],
      completedVideoIds: ["video-1"],
      passedQuizIds: ["quiz-1"],
      discoveredPointIds: ["point-1", "point-2"],
      currentMapId: "main-map",
      playerPosition: { mapId: "main-map", x: 2, y: 2 }
    },
    videoStats: [
      {
        uid: "seed-user",
        videoId: "video-1",
        watchCount: 1,
        completedRequiredWatch: true,
        unlockedAt: new Date(),
        firstWatchedAt: new Date(),
        lastWatchedAt: new Date()
      }
    ],
    quizResults: [
      {
        uid: "seed-user",
        quizId: "quiz-1",
        videoId: "video-1",
        attempts: 1,
        latestScore: 100,
        passed: true,
        lastAnsweredAt: new Date(),
        answerHistory: [
          {
            answeredAt: new Date(),
            score: 100,
            passed: true
          }
        ]
      }
    ]
  });
};

const main = async () => {
  await seedUiEmulators();
  console.log("Local UI emulators seeded.");
};

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
