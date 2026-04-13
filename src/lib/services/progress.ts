import type {
  Quiz,
  QuizQuestion,
  UserProgress,
  UserQuizResult,
  UserVideoStat,
  Video,
  WithId
} from "@/types/models";

export const isGenderAllowed = (userGender: string, targetGender: string) =>
  targetGender === "all" || userGender === targetGender;

export const hasWatchedEnough = (video: Video, stat?: UserVideoStat) =>
  (stat?.watchCount ?? 0) >= video.requiredWatchCount;

export const hasPassedQuizForVideo = (
  videoId: string,
  quizzes: WithId<Quiz>[],
  results: WithId<UserQuizResult>[]
) => {
  const linkedQuiz = quizzes.find((item) => item.data.videoId === videoId);
  if (!linkedQuiz) return true;
  return results.some((item) => item.id === `${item.data.uid}_${linkedQuiz.id}` && item.data.passed);
};

export const canUnlockVideo = ({
  video,
  userGender,
  progress,
  videoStats,
  quizResults
}: {
  video: Video;
  userGender: string;
  progress: UserProgress | null;
  videoStats: WithId<UserVideoStat>[];
  quizResults: WithId<UserQuizResult>[];
  quizzes: WithId<Quiz>[];
}) => {
  if (!video.isPublished) return false;
  if (!isGenderAllowed(userGender, video.targetGender)) return false;
  if (video.prerequisiteLevel && (progress?.currentLevel ?? 1) < video.prerequisiteLevel) return false;

  const hasAllVideos = video.prerequisiteVideoIds.every((id) => {
    const stat = videoStats.find((item) => item.data.videoId === id)?.data;
    return !!stat?.completedRequiredWatch || progress?.completedVideoIds.includes(id);
  });

  const hasAllQuizzes = video.prerequisiteQuizIds.every((quizId) =>
    quizResults.some((item) => item.data.quizId === quizId && item.data.passed)
  );

  return hasAllVideos && hasAllQuizzes;
};

export const recalculateProgress = ({
  videos,
  quizzes,
  videoStats,
  quizResults,
  current
}: {
  videos: WithId<Video>[];
  quizzes: WithId<Quiz>[];
  videoStats: WithId<UserVideoStat>[];
  quizResults: WithId<UserQuizResult>[];
  current: UserProgress | null;
}) => {
  const unlocked = new Set(current?.unlockedVideoIds ?? []);
  const completed = new Set<string>();
  const passedQuizIds = new Set<string>();

  quizResults.forEach((result) => {
    if (result.data.passed) passedQuizIds.add(result.data.quizId);
  });

  videos.forEach((video) => {
    const stat = videoStats.find((item) => item.data.videoId === video.id)?.data;
    if ((stat?.watchCount ?? 0) >= video.data.requiredWatchCount) completed.add(video.id);
  });

  const highestLevel = videos
    .filter((video) => completed.has(video.id))
    .reduce((max, video) => Math.max(max, video.data.level), 1);

  videos.forEach((video) => {
    if (
      video.data.prerequisiteVideoIds.every((id) => completed.has(id)) &&
      video.data.prerequisiteQuizIds.every((id) => passedQuizIds.has(id))
    ) {
      unlocked.add(video.id);
    }
  });

  return {
    currentLevel: highestLevel,
    unlockedVideoIds: Array.from(unlocked),
    completedVideoIds: Array.from(completed),
    passedQuizIds: Array.from(passedQuizIds),
    discoveredPointIds: current?.discoveredPointIds ?? [],
    currentMapId: current?.currentMapId ?? null,
    playerPosition: current?.playerPosition ?? null
  };
};

export const scoreQuiz = (
  questions: WithId<QuizQuestion>[],
  answers: Record<string, string>,
  passingScore: number
) => {
  const correctCount = questions.filter((question) => answers[question.id] === question.data.correctAnswer).length;
  const total = questions.length || 1;
  const score = Math.round((correctCount / total) * 100);
  return {
    score,
    passed: score >= passingScore
  };
};
