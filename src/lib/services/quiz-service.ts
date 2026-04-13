import { getDocument, listCollection, listOrderedCollection, patchDocument, saveDocument } from "@/lib/utils/firestore";
import { recalculateProgress, scoreQuiz } from "@/lib/services/progress";
import type {
  Quiz,
  QuizQuestion,
  QuizSubmissionInput,
  UserProgress,
  UserQuizResult,
  UserVideoStat,
  Video,
  WithId
} from "@/types/models";

export const getUnlockedQuizBundle = async (
  uid: string,
  videoId: string
): Promise<{
  progress: UserProgress | null;
  quiz: WithId<Quiz> | null;
  questions: WithId<QuizQuestion>[];
}> => {
  const progressDoc = await getDocument<UserProgress>("userProgress", uid);
  const progress = progressDoc?.data ?? null;
  const isAccessible = !!progress && (progress.unlockedVideoIds.includes(videoId) || progress.completedVideoIds.includes(videoId));
  if (!isAccessible) return { progress, quiz: null, questions: [] };

  const quizzes = await listCollection<Quiz>("quizzes", "videoId", videoId);
  const quiz = quizzes[0] ?? null;
  if (!quiz) return { progress, quiz: null, questions: [] };

  const questions = await listCollection<QuizQuestion>("quizQuestions", "quizId", quiz.id);
  return {
    progress,
    quiz,
    questions: questions.sort((a, b) => a.data.sortOrder - b.data.sortOrder)
  };
};

export const submitQuizAnswers = async ({
  uid,
  submission,
  questions,
  passingScore,
  progress,
  userGender
}: {
  uid: string;
  submission: QuizSubmissionInput;
  questions: WithId<QuizQuestion>[];
  passingScore: number;
  progress: UserProgress;
  userGender: Video["targetGender"];
}): Promise<{ progress: UserProgress; passed: boolean; score: number }> => {
  const evaluated = scoreQuiz(questions, submission.answers, passingScore);
  const resultId = `${uid}_${submission.quizId}`;
  const previous = (await getDocument<UserQuizResult>("userQuizResults", resultId))?.data;

  await saveDocument<UserQuizResult>("userQuizResults", resultId, {
    uid,
    quizId: submission.quizId,
    videoId: submission.videoId,
    attempts: (previous?.attempts ?? 0) + 1,
    latestScore: evaluated.score,
    passed: evaluated.passed,
    lastAnsweredAt: new Date(),
    answerHistory: [
      ...(previous?.answerHistory ?? []),
      {
        answeredAt: new Date(),
        score: evaluated.score,
        passed: evaluated.passed
      }
    ]
  });

  const [allVideos, allVideoStats, allQuizResults] = await Promise.all([
    listOrderedCollection<Video>("videos", "order"),
    listOrderedCollection<UserVideoStat>("userVideoStats", "videoId"),
    listOrderedCollection<UserQuizResult>("userQuizResults", "quizId")
  ]);

  const nextProgress = recalculateProgress({
    videos: allVideos.filter(
      (item) => item.data.isPublished && (item.data.targetGender === "all" || item.data.targetGender === userGender)
    ),
    videoStats: allVideoStats.filter((item) => item.data.uid === uid),
    quizResults: allQuizResults.filter((item) => item.data.uid === uid).concat([
      {
        id: resultId,
        data: {
          uid,
          quizId: submission.quizId,
          videoId: submission.videoId,
          attempts: (previous?.attempts ?? 0) + 1,
          latestScore: evaluated.score,
          passed: evaluated.passed,
          lastAnsweredAt: new Date(),
          answerHistory: []
        }
      }
    ]),
    current: progress
  });

  await patchDocument<UserProgress>("userProgress", uid, nextProgress);
  return {
    progress: { ...progress, ...nextProgress },
    passed: evaluated.passed,
    score: evaluated.score
  };
};
