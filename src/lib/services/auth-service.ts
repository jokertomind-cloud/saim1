import { createUserWithEmailAndPassword, sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase/client";
import { getDocument, saveDocument } from "@/lib/utils/firestore";
import type { AuthRegisterInput, GameMap, UserProfile, UserProgress } from "@/types/models";

const DEFAULT_MAP_ID = "main-map";
const DEFAULT_VIDEO_ID = "video-1";

export const loginWithEmail = (email: string, password: string) =>
  signInWithEmailAndPassword(getFirebaseAuth(), email, password);

export const requestPasswordReset = (email: string) => sendPasswordResetEmail(getFirebaseAuth(), email);

export const registerUserAccount = async (input: AuthRegisterInput): Promise<string> => {
  const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), input.email, input.password);
  const uid = credential.user.uid;
  const firstMap = await getDocument<GameMap>("maps", DEFAULT_MAP_ID);

  const profile: UserProfile = {
    displayName: input.displayName,
    email: input.email,
    gender: input.gender,
    avatarId: input.avatarId,
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date()
  };

  const progress: UserProgress = {
    currentLevel: 1,
    unlockedVideoIds: [DEFAULT_VIDEO_ID],
    completedVideoIds: [],
    passedQuizIds: [],
    discoveredPointIds: [],
    currentMapId: DEFAULT_MAP_ID,
    playerPosition: firstMap
      ? {
          mapId: DEFAULT_MAP_ID,
          x: firstMap.data.startX,
          y: firstMap.data.startY
        }
      : { mapId: DEFAULT_MAP_ID, x: 0, y: 0 },
    createdAt: new Date(),
    updatedAt: new Date()
  };

  await saveDocument<UserProfile>("users", uid, profile);
  await saveDocument<UserProgress>("userProgress", uid, progress);

  return uid;
};
