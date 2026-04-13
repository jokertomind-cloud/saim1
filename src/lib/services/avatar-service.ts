import { listOrderedCollection } from "@/lib/utils/firestore";
import type { Avatar, WithId } from "@/types/models";

export const listActiveAvatars = async (): Promise<WithId<Avatar>[]> => {
  const avatars = await listOrderedCollection<Avatar>("avatars", "sortOrder");
  return avatars.filter((item) => item.data.isActive);
};

export const listAllAvatars = async (): Promise<WithId<Avatar>[]> =>
  listOrderedCollection<Avatar>("avatars", "sortOrder");
