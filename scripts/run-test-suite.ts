import assert from "node:assert/strict";
import { seedData } from "../firebase/seed/seed-data";
import { recalculateProgress, scoreQuiz, canUnlockVideo, hasWatchedEnough, isGenderAllowed } from "../src/lib/services/progress";
import {
  avatarSchema,
  mapPointSchema,
  mapSchema,
  profileSchema,
  quizSchema,
  registerSchema,
  videoSchema
} from "../src/lib/validators/forms";
import type {
  Quiz,
  QuizQuestion,
  UserProgress,
  UserQuizResult,
  UserVideoStat,
  Video,
  WithId
} from "../src/types/models";

const results: string[] = [];

const test = (name: string, fn: () => void) => {
  try {
    fn();
    results.push(`PASS: ${name}`);
  } catch (error) {
    results.push(`FAIL: ${name}`);
    throw error;
  }
};

const toVideoList = (): WithId<Video>[] =>
  Object.entries(seedData.videos).map(([id, data]) => ({ id, data }));

const toQuizList = (): WithId<Quiz>[] =>
  Object.entries(seedData.quizzes).map(([id, data]) => ({ id, data }));

const toQuestionList = (): WithId<QuizQuestion>[] =>
  Object.entries(seedData.quizQuestions).map(([id, data]) => ({ id, data }));

const makeProgress = (overrides?: Partial<UserProgress>): UserProgress => ({
  currentLevel: 1,
  unlockedVideoIds: ["video-1"],
  completedVideoIds: [],
  passedQuizIds: [],
  discoveredPointIds: [],
  currentMapId: "main-map",
  playerPosition: { mapId: "main-map", x: 0, y: 0 },
  ...overrides
});

const makeVideoStats = (items: Array<UserVideoStat & { id: string }>): WithId<UserVideoStat>[] =>
  items.map(({ id, ...data }) => ({ id, data }));

const makeQuizResults = (items: Array<UserQuizResult & { id: string }>): WithId<UserQuizResult>[] =>
  items.map(({ id, ...data }) => ({ id, data }));

const validateSchemas = () => {
  test("register schema accepts valid input", () => {
    assert.ok(
      registerSchema.safeParse({
        displayName: "テスト太郎",
        gender: "other",
        avatarId: "avatar-boy-01",
        email: "test@example.com",
        password: "secret12"
      }).success
    );
  });

  test("register schema rejects invalid email", () => {
    assert.equal(
      registerSchema.safeParse({
        displayName: "ab",
        gender: "male",
        avatarId: "avatar-boy-01",
        email: "invalid",
        password: "secret12"
      }).success,
      false
    );
  });

  test("profile schema rejects empty avatar", () => {
    assert.equal(
      profileSchema.safeParse({
        displayName: "太郎",
        gender: "male",
        avatarId: ""
      }).success,
      false
    );
  });

  test("map schema accepts valid minimum values", () => {
    assert.ok(
      mapSchema.safeParse({
        name: "map",
        description: "desc",
        width: 3,
        height: 3,
        tileSize: 32,
        startX: 0,
        startY: 0,
        sortOrder: 0
      }).success
    );
  });

  test("map point schema rejects invalid icon", () => {
    assert.equal(
      mapPointSchema.safeParse({
        mapId: "main-map",
        name: "point",
        description: "desc",
        x: 0,
        y: 0,
        iconType: "bad",
        prerequisiteVideoIds: "",
        prerequisiteQuizIds: "",
        prerequisiteLevel: null,
        videoIds: "",
        sortOrder: 0
      }).success,
      false
    );
  });

  test("video schema rejects invalid youtube url", () => {
    assert.equal(
      videoSchema.safeParse({
        title: "video",
        description: "desc",
        youtubeUrl: "bad-url",
        youtubeVideoId: "abc",
        mapPointId: "point-1",
        level: 1,
        order: 1,
        requiredWatchCount: 1,
        targetGender: "all",
        prerequisiteVideoIds: "",
        prerequisiteQuizIds: "",
        prerequisiteLevel: null,
        playbackMode: "embed"
      }).success,
      false
    );
  });

  test("quiz schema rejects passing score over 100", () => {
    assert.equal(
      quizSchema.safeParse({
        videoId: "video-1",
        title: "quiz",
        description: "desc",
        passingScore: 101,
        questionText: "q",
        questionType: "multiple_choice",
        optionA: "a",
        optionB: "b",
        optionC: "c",
        optionD: "d",
        correctAnswer: "A",
        explanation: "exp"
      }).success,
      false
    );
  });

  test("avatar schema accepts valid data", () => {
    assert.ok(
      avatarSchema.safeParse({
        name: "ブルー",
        imageUrl: "/avatars/avatar-boy-01.svg",
        thumbnailUrl: "/avatars/avatar-boy-01.svg",
        sortOrder: 1
      }).success
    );
  });
};

const validateSeedData = () => {
  const mapIds = new Set(Object.keys(seedData.maps));
  const pointIds = new Set(Object.keys(seedData.mapPoints));
  const videoIds = new Set(Object.keys(seedData.videos));
  const quizIds = new Set(Object.keys(seedData.quizzes));

  test("all point mapId references exist", () => {
    Object.values(seedData.mapPoints).forEach((point) => assert.ok(mapIds.has(point.mapId)));
  });

  test("all video mapPointId references exist", () => {
    Object.values(seedData.videos).forEach((video) => assert.ok(pointIds.has(video.mapPointId)));
  });

  test("all quiz videoId references exist", () => {
    Object.values(seedData.quizzes).forEach((quiz) => assert.ok(videoIds.has(quiz.videoId)));
  });

  test("all question quizId references exist", () => {
    Object.values(seedData.quizQuestions).forEach((question) => assert.ok(quizIds.has(question.quizId)));
  });

  test("all mapPoint videoIds exist", () => {
    Object.values(seedData.mapPoints).forEach((point) =>
      point.videoIds.forEach((videoId) => assert.ok(videoIds.has(videoId)))
    );
  });

  test("all prerequisite references exist", () => {
    Object.values(seedData.videos).forEach((video) => {
      video.prerequisiteVideoIds.forEach((videoId) => assert.ok(videoIds.has(videoId)));
      video.prerequisiteQuizIds.forEach((quizId) => assert.ok(quizIds.has(quizId)));
    });
    Object.values(seedData.mapPoints).forEach((point) => {
      point.prerequisiteVideoIds.forEach((videoId) => assert.ok(videoIds.has(videoId)));
      point.prerequisiteQuizIds.forEach((quizId) => assert.ok(quizIds.has(quizId)));
    });
  });

  test("map coordinates and obstacles stay in bounds", () => {
    Object.values(seedData.maps).forEach((map) => {
      assert.ok(map.startX >= 0 && map.startX < map.width);
      assert.ok(map.startY >= 0 && map.startY < map.height);
      map.obstacles.forEach((obstacle) => {
        assert.ok(obstacle.x >= 0 && obstacle.x < map.width);
        assert.ok(obstacle.y >= 0 && obstacle.y < map.height);
      });
    });
  });

  test("map point coordinates stay in bounds", () => {
    Object.values(seedData.mapPoints).forEach((point) => {
      const map = seedData.maps[point.mapId as keyof typeof seedData.maps];
      assert.ok(point.x >= 0 && point.x < map.width);
      assert.ok(point.y >= 0 && point.y < map.height);
    });
  });

  test("every quiz has at least one question", () => {
    Object.keys(seedData.quizzes).forEach((quizId) => {
      assert.ok(Object.values(seedData.quizQuestions).some((question) => question.quizId === quizId));
    });
  });

  test("every video has at least one quiz", () => {
    Object.keys(seedData.videos).forEach((videoId) => {
      assert.ok(Object.values(seedData.quizzes).some((quiz) => quiz.videoId === videoId));
    });
  });

  test("question correctAnswer exists in options", () => {
    Object.values(seedData.quizQuestions).forEach((question) => {
      assert.ok(question.options.some((option) => option.key === question.correctAnswer));
    });
  });

  test("true_false questions have exactly two options", () => {
    Object.values(seedData.quizQuestions)
      .filter((question) => question.questionType === "true_false")
      .forEach((question) => assert.equal(question.options.length, 2));
  });
};

const validateProgressLogic = () => {
  const videos = toVideoList();
  const quizzes = toQuizList();
  const questions = toQuestionList();

  test("gender helper passes and blocks appropriately", () => {
    assert.equal(isGenderAllowed("male", "all"), true);
    assert.equal(isGenderAllowed("male", "male"), true);
    assert.equal(isGenderAllowed("male", "female"), false);
  });

  test("watch count helper respects threshold", () => {
    const video = seedData.videos["video-2"];
    assert.equal(hasWatchedEnough(video, { uid: "u", videoId: "video-2", watchCount: 1, completedRequiredWatch: false, unlockedAt: null, firstWatchedAt: null, lastWatchedAt: null }), false);
    assert.equal(hasWatchedEnough(video, { uid: "u", videoId: "video-2", watchCount: 2, completedRequiredWatch: true, unlockedAt: null, firstWatchedAt: null, lastWatchedAt: null }), true);
  });

  test("scoreQuiz returns 100 for all-correct answers", () => {
    const quizQuestions = questions.filter((item) => item.data.quizId === "quiz-1");
    const result = scoreQuiz(quizQuestions, { "question-quiz-1": "A" }, 100);
    assert.equal(result.score, 100);
    assert.equal(result.passed, true);
  });

  test("scoreQuiz returns fail for wrong answer", () => {
    const quizQuestions = questions.filter((item) => item.data.quizId === "quiz-1");
    const result = scoreQuiz(quizQuestions, { "question-quiz-1": "B" }, 100);
    assert.equal(result.score, 0);
    assert.equal(result.passed, false);
  });

  test("video-2 stays locked before prerequisites are met", () => {
    const video2 = seedData.videos["video-2"];
    const unlocked = canUnlockVideo({
      video: video2,
      userGender: "other",
      progress: makeProgress(),
      videoStats: [],
      quizResults: []
    });
    assert.equal(unlocked, false);
  });

  test("recalculateProgress unlocks video-2 after video-1 completion and quiz-1 pass", () => {
    const progress = makeProgress();
    const videoStats = makeVideoStats([
      {
        id: "user_video-1",
        uid: "user",
        videoId: "video-1",
        watchCount: 1,
        completedRequiredWatch: true,
        unlockedAt: null,
        firstWatchedAt: null,
        lastWatchedAt: null
      }
    ]);
    const quizResults = makeQuizResults([
      {
        id: "user_quiz-1",
        uid: "user",
        quizId: "quiz-1",
        videoId: "video-1",
        attempts: 1,
        latestScore: 100,
        passed: true,
        lastAnsweredAt: null,
        answerHistory: []
      }
    ]);

    const next = recalculateProgress({
      videos,
      videoStats,
      quizResults,
      current: progress
    });

    assert.ok(next.completedVideoIds.includes("video-1"));
    assert.ok(next.unlockedVideoIds.includes("video-2"));
  });

  test("recalculateProgress unlocks video-3 after video-2 completion and quiz-2 pass", () => {
    const progress = makeProgress({
      unlockedVideoIds: ["video-1", "video-2"],
      completedVideoIds: ["video-1"],
      passedQuizIds: ["quiz-1"],
      currentLevel: 2
    });
    const videoStats = makeVideoStats([
      {
        id: "user_video-1",
        uid: "user",
        videoId: "video-1",
        watchCount: 1,
        completedRequiredWatch: true,
        unlockedAt: null,
        firstWatchedAt: null,
        lastWatchedAt: null
      },
      {
        id: "user_video-2",
        uid: "user",
        videoId: "video-2",
        watchCount: 2,
        completedRequiredWatch: true,
        unlockedAt: null,
        firstWatchedAt: null,
        lastWatchedAt: null
      }
    ]);
    const quizResults = makeQuizResults([
      {
        id: "user_quiz-1",
        uid: "user",
        quizId: "quiz-1",
        videoId: "video-1",
        attempts: 1,
        latestScore: 100,
        passed: true,
        lastAnsweredAt: null,
        answerHistory: []
      },
      {
        id: "user_quiz-2",
        uid: "user",
        quizId: "quiz-2",
        videoId: "video-2",
        attempts: 1,
        latestScore: 100,
        passed: true,
        lastAnsweredAt: null,
        answerHistory: []
      }
    ]);

    const next = recalculateProgress({
      videos,
      videoStats,
      quizResults,
      current: progress
    });

    assert.ok(next.completedVideoIds.includes("video-2"));
    assert.ok(next.unlockedVideoIds.includes("video-3"));
    assert.equal(next.currentLevel >= 2, true);
  });
};

const main = () => {
  validateSchemas();
  validateSeedData();
  validateProgressLogic();

  console.log("Test suite completed.");
  results.forEach((result) => console.log(result));
};

main();
