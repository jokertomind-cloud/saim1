import { listCollection } from "@/lib/utils/firestore";
import type { UserQuizResult, UserVideoStat, WithId } from "@/types/models";

export const listUserVideoStats = async (uid: string): Promise<WithId<UserVideoStat>[]> => {
  const stats = await listCollection<UserVideoStat>("userVideoStats", "uid", uid);
  return stats.sort((a, b) => a.data.videoId.localeCompare(b.data.videoId));
};

export const listUserQuizResults = async (uid: string): Promise<WithId<UserQuizResult>[]> => {
  const results = await listCollection<UserQuizResult>("userQuizResults", "uid", uid);
  return results.sort((a, b) => a.data.quizId.localeCompare(b.data.quizId));
};
