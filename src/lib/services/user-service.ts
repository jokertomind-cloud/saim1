import { getDocument, listOrderedCollection, patchDocument } from "@/lib/utils/firestore";
import type { ProfileInput, UserProfile, UserProgress, WithId } from "@/types/models";

export const getUserProfile = async (uid: string): Promise<UserProfile | null> => {
  const user = await getDocument<UserProfile>("users", uid);
  return user?.data ?? null;
};

export const updateUserProfile = async (uid: string, input: ProfileInput) => {
  await patchDocument<UserProfile>("users", uid, input);
};

export const touchLastLogin = async (uid: string) => {
  await patchDocument<UserProfile>("users", uid, { lastLoginAt: new Date() });
};

export const getUserProgress = async (uid: string): Promise<UserProgress | null> => {
  const progress = await getDocument<UserProgress>("userProgress", uid);
  return progress?.data ?? null;
};

export const listUsers = (): Promise<WithId<UserProfile>[]> =>
  listOrderedCollection<UserProfile>("users", "displayName");
