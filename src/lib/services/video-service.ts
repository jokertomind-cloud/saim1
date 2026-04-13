import { getDocument, getDocumentsByIds, listCollection, listOrderedCollection, patchDocument, saveDocument } from "@/lib/utils/firestore";
import { recalculateProgress } from "@/lib/services/progress";
import type { Quiz, UserProgress, UserQuizResult, UserVideoStat, Video, WithId } from "@/types/models";

export const listVisibleVideos = async (videoIds: string[]): Promise<WithId<Video>[]> => {
  if (!videoIds.length) return [];
  const videos = await getDocumentsByIds<Video>("videos", videoIds);
  return videos.sort((a, b) => a.data.order - b.data.order);
};

export const getUnlockedVideoBundle = async (
  uid: string,
  videoId: string
): Promise<{
  progress: UserProgress | null;
  video: Video | null;
  quizzes: WithId<Quiz>[];
}> => {
  const progressDoc = await getDocument<UserProgress>("userProgress", uid);
  const progress = progressDoc?.data ?? null;
  const isAccessible = !!progress && (progress.unlockedVideoIds.includes(videoId) || progress.completedVideoIds.includes(videoId));

  if (!isAccessible) {
    return { progress, video: null, quizzes: [] };
  }

  const [videoDoc, quizzes] = await Promise.all([
    getDocument<Video>("videos", videoId),
    listCollection<Quiz>("quizzes", "videoId", videoId)
  ]);

  return {
    progress,
    video: videoDoc?.data ?? null,
    quizzes: quizzes.filter((item) => item.data.isPublished)
  };
};

export const recordVideoWatch = async ({
  uid,
  videoId,
  video,
  progress,
  userGender
}: {
  uid: string;
  videoId: string;
  video: Video;
  progress: UserProgress;
  userGender: Video["targetGender"];
}): Promise<UserProgress> => {
  const statId = `${uid}_${videoId}`;
  const existingStats = await listCollection<UserVideoStat>("userVideoStats", "uid", uid);
  const previousStat = existingStats.find((item) => item.data.videoId === videoId)?.data;
  const nextWatchCount = (previousStat?.watchCount ?? 0) + 1;

  await saveDocument<UserVideoStat>("userVideoStats", statId, {
    uid,
    videoId,
    watchCount: nextWatchCount,
    completedRequiredWatch: nextWatchCount >= video.requiredWatchCount,
    unlockedAt: previousStat?.unlockedAt ?? new Date(),
    firstWatchedAt: previousStat?.firstWatchedAt ?? new Date(),
    lastWatchedAt: new Date()
  });

  const [allVideos, allVideoStats, allQuizResults] = await Promise.all([
    listOrderedCollection<Video>("videos", "order"),
    listCollection<UserVideoStat>("userVideoStats", "uid", uid),
    listCollection<UserQuizResult>("userQuizResults", "uid", uid)
  ]);

  const nextProgress = recalculateProgress({
    videos: allVideos.filter(
      (item) => item.data.isPublished && (item.data.targetGender === "all" || item.data.targetGender === userGender)
    ),
    videoStats: allVideoStats,
    quizResults: allQuizResults,
    current: progress
  });

  await patchDocument<UserProgress>("userProgress", uid, nextProgress);
  return { ...progress, ...nextProgress };
};
