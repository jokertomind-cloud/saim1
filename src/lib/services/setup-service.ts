import { type UserProgress, type UserProfile, type SetupBootstrapInput, type GameMap } from "@/types/models";
import { seedData } from "../../../firebase/seed/seed-data";
import { getServerAdminAuth, getServerAdminDb, serverTimestamp } from "../firebase/admin-server";

const DEFAULT_MAP_ID = "main-map";
const DEFAULT_VIDEO_ID = "video-1";
const SETUP_DOC_ID = "setup";

const ensureSetupToken = (setupToken: string) => {
  const expectedToken = process.env.APP_SETUP_TOKEN;

  if (!expectedToken) {
    throw new Error("APP_SETUP_TOKEN が未設定です。App Hosting のシークレットまたは環境変数に設定してください。");
  }

  if (setupToken !== expectedToken) {
    throw new Error("セットアップトークンが正しくありません。");
  }
};

const seedCollection = async (name: keyof typeof seedData) => {
  const db = getServerAdminDb();
  const entries = Object.entries(seedData[name]);

  for (const [id, data] of entries) {
    await db.collection(name).doc(id).set(
      {
        ...data,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );
  }
};

const ensureSetupIsStillAvailable = async () => {
  const db = getServerAdminDb();
  const setupDoc = await db.collection("appConfig").doc(SETUP_DOC_ID).get();

  if (setupDoc.exists) {
    throw new Error(
      "初回セットアップはすでに完了しています。再実行したい場合は APP_SETUP_TOKEN を更新し、管理者向けの運用手順に従ってください。"
    );
  }
};

const ensureUserProfile = async (uid: string, input: SetupBootstrapInput) => {
  const db = getServerAdminDb();
  const userRef = db.collection("users").doc(uid);
  const existing = await userRef.get();

  if (!existing.exists) {
    const profile: UserProfile = {
      displayName: input.displayName,
      email: input.email,
      gender: input.gender,
      avatarId: input.avatarId,
      role: "admin"
    };

    await userRef.set({
      ...profile,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      lastLoginAt: null
    });
    return;
  }

  await userRef.set(
    {
      displayName: input.displayName,
      email: input.email,
      gender: input.gender,
      avatarId: input.avatarId,
      role: "admin",
      updatedAt: serverTimestamp()
    },
    { merge: true }
  );
};

const ensureUserProgress = async (uid: string) => {
  const db = getServerAdminDb();
  const progressRef = db.collection("userProgress").doc(uid);
  const existing = await progressRef.get();

  if (existing.exists) {
    return;
  }

  const mapDoc = await db.collection("maps").doc(DEFAULT_MAP_ID).get();
  const fallbackMap = seedData.maps[DEFAULT_MAP_ID];
  const mapData = (mapDoc.exists ? (mapDoc.data() as Partial<GameMap>) : fallbackMap) ?? fallbackMap;

  const progress: UserProgress = {
    currentLevel: 1,
    unlockedVideoIds: [DEFAULT_VIDEO_ID],
    completedVideoIds: [],
    passedQuizIds: [],
    discoveredPointIds: [],
    currentMapId: DEFAULT_MAP_ID,
    playerPosition: {
      mapId: DEFAULT_MAP_ID,
      x: mapData.startX ?? 0,
      y: mapData.startY ?? 0
    }
  };

  await progressRef.set({
    ...progress,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  });
};

const ensureAdminAuthUser = async (input: SetupBootstrapInput) => {
  const auth = getServerAdminAuth();

  try {
    const existing = await auth.getUserByEmail(input.email);
    await auth.updateUser(existing.uid, {
      displayName: input.displayName,
      password: input.password
    });
    return existing.uid;
  } catch (error) {
    if (typeof error === "object" && error !== null && "code" in error && error.code === "auth/user-not-found") {
      const created = await auth.createUser({
        email: input.email,
        password: input.password,
        displayName: input.displayName,
        emailVerified: true
      });
      return created.uid;
    }

    throw error;
  }
};

const grantAdminClaim = async (uid: string) => {
  const auth = getServerAdminAuth();
  const userRecord = await auth.getUser(uid);
  const currentClaims = (userRecord.customClaims ?? {}) as Record<string, unknown>;

  await auth.setCustomUserClaims(uid, {
    ...currentClaims,
    admin: true
  });
};

const markSetupCompleted = async (uid: string, input: SetupBootstrapInput) => {
  const db = getServerAdminDb();
  await db.collection("appConfig").doc(SETUP_DOC_ID).set({
    completedAt: serverTimestamp(),
    completedByUid: uid,
    adminEmail: input.email,
    updatedAt: serverTimestamp()
  });
};

export const runHostedBootstrap = async (input: SetupBootstrapInput) => {
  ensureSetupToken(input.setupToken);
  await ensureSetupIsStillAvailable();

  await seedCollection("avatars");
  await seedCollection("maps");
  await seedCollection("mapPoints");
  await seedCollection("videos");
  await seedCollection("quizzes");
  await seedCollection("quizQuestions");

  const uid = await ensureAdminAuthUser(input);
  await ensureUserProfile(uid, input);
  await ensureUserProgress(uid);
  await grantAdminClaim(uid);
  await markSetupCompleted(uid, input);

  return {
    uid,
    email: input.email,
    seededCollections: ["avatars", "maps", "mapPoints", "videos", "quizzes", "quizQuestions"] as const
  };
};
