import { listOrderedCollection } from "@/lib/utils/firestore";
import type { UserQuizResult, UserVideoStat, WithId } from "@/types/models";

export const listUserVideoStats = async (uid: string): Promise<WithId<UserVideoStat>[]> => {
  const stats = await listOrderedCollection<UserVideoStat>("userVideoStats", "videoId");
  return stats.filter((item) => item.data.uid === uid);
};

export const listUserQuizResults = async (uid: string): Promise<WithId<UserQuizResult>[]> => {
  const results = await listOrderedCollection<UserQuizResult>("userQuizResults", "quizId");
  return results.filter((item) => item.data.uid === uid);
};
