import type { Avatar, GameMap, MapPoint, Quiz, QuizQuestion, Video } from "../../src/types/models";

interface SeedDataShape {
  avatars: Record<string, Avatar>;
  maps: Record<string, GameMap>;
  mapPoints: Record<string, MapPoint>;
  videos: Record<string, Video>;
  quizzes: Record<string, Quiz>;
  quizQuestions: Record<string, QuizQuestion>;
}

export const seedData = {
  avatars: {
    "avatar-boy-01": {
      name: "ブルー",
      imageUrl: "/avatars/avatar-boy-01.svg",
      thumbnailUrl: "/avatars/avatar-boy-01.svg",
      sortOrder: 1,
      isActive: true
    },
    "avatar-girl-01": {
      name: "ピンク",
      imageUrl: "/avatars/avatar-girl-01.svg",
      thumbnailUrl: "/avatars/avatar-girl-01.svg",
      sortOrder: 2,
      isActive: true
    },
    "avatar-neutral-01": {
      name: "グリーン",
      imageUrl: "/avatars/avatar-neutral-01.svg",
      thumbnailUrl: "/avatars/avatar-neutral-01.svg",
      sortOrder: 3,
      isActive: true
    }
  },
  maps: {
    "main-map": {
      name: "はじめての学習マップ",
      description: "3つの地点をたどって学習を進めます。",
      width: 5,
      height: 5,
      tileSize: 56,
      backgroundImageUrl: null,
      startX: 0,
      startY: 0,
      obstacles: [
        { x: 1, y: 1 },
        { x: 3, y: 3 }
      ],
      isActive: true,
      sortOrder: 1
    }
  },
  mapPoints: {
    "point-1": {
      mapId: "main-map",
      name: "スタート地点",
      description: "動画1を学びます。",
      x: 0,
      y: 2,
      iconType: "video",
      videoIds: ["video-1"],
      prerequisiteVideoIds: [],
      prerequisiteQuizIds: [],
      prerequisiteLevel: null,
      isActive: true,
      sortOrder: 1
    },
    "point-2": {
      mapId: "main-map",
      name: "まんなか地点",
      description: "動画2は動画1の視聴とクイズ1合格で解放されます。",
      x: 2,
      y: 2,
      iconType: "video",
      videoIds: ["video-2"],
      prerequisiteVideoIds: ["video-1"],
      prerequisiteQuizIds: ["quiz-1"],
      prerequisiteLevel: 1,
      isActive: true,
      sortOrder: 2
    },
    "point-3": {
      mapId: "main-map",
      name: "ゴール地点",
      description: "動画3は動画2の条件達成後に解放されます。",
      x: 4,
      y: 2,
      iconType: "goal",
      videoIds: ["video-3"],
      prerequisiteVideoIds: ["video-2"],
      prerequisiteQuizIds: ["quiz-2"],
      prerequisiteLevel: 2,
      isActive: true,
      sortOrder: 3
    }
  },
  videos: {
    "video-1": {
      title: "あいさつの基本",
      description: "最初の学習動画です。",
      youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      youtubeVideoId: "dQw4w9WgXcQ",
      mapPointId: "point-1",
      level: 1,
      order: 1,
      requiredWatchCount: 1,
      targetGender: "all",
      prerequisiteVideoIds: [],
      prerequisiteQuizIds: [],
      prerequisiteLevel: null,
      playbackMode: "embed",
      isPublished: true
    },
    "video-2": {
      title: "身だしなみチェック",
      description: "2本目の学習動画です。",
      youtubeUrl: "https://www.youtube.com/watch?v=ysz5S6PUM-U",
      youtubeVideoId: "ysz5S6PUM-U",
      mapPointId: "point-2",
      level: 2,
      order: 2,
      requiredWatchCount: 2,
      targetGender: "all",
      prerequisiteVideoIds: ["video-1"],
      prerequisiteQuizIds: ["quiz-1"],
      prerequisiteLevel: 1,
      playbackMode: "embed",
      isPublished: true
    },
    "video-3": {
      title: "まとめテスト前の復習",
      description: "3本目の学習動画です。",
      youtubeUrl: "https://www.youtube.com/watch?v=jNQXAC9IVRw",
      youtubeVideoId: "jNQXAC9IVRw",
      mapPointId: "point-3",
      level: 3,
      order: 3,
      requiredWatchCount: 1,
      targetGender: "all",
      prerequisiteVideoIds: ["video-2"],
      prerequisiteQuizIds: ["quiz-2"],
      prerequisiteLevel: 2,
      playbackMode: "embed",
      isPublished: true
    }
  },
  quizzes: {
    "quiz-1": {
      videoId: "video-1",
      title: "クイズ1",
      description: "動画1の確認です。",
      passingScore: 100,
      isPublished: true
    },
    "quiz-2": {
      videoId: "video-2",
      title: "クイズ2",
      description: "動画2の確認です。",
      passingScore: 100,
      isPublished: true
    },
    "quiz-3": {
      videoId: "video-3",
      title: "クイズ3",
      description: "動画3の確認です。",
      passingScore: 100,
      isPublished: true
    }
  },
  quizQuestions: {
    "question-quiz-1": {
      quizId: "quiz-1",
      questionText: "あいさつで最初に大切なのはどれですか？",
      questionType: "multiple_choice",
      options: [
        { key: "A", text: "笑顔で目を見る" },
        { key: "B", text: "無言で立つ" },
        { key: "C", text: "うつむく" },
        { key: "D", text: "急いで歩く" }
      ],
      correctAnswer: "A",
      explanation: "相手を見て笑顔であいさつするのが基本です。",
      sortOrder: 1
    },
    "question-quiz-2": {
      quizId: "quiz-2",
      questionText: "身だしなみは学習前に確認したほうがよい。",
      questionType: "true_false",
      options: [
        { key: "A", text: "○" },
        { key: "B", text: "×" }
      ],
      correctAnswer: "A",
      explanation: "学習や面談の前に整えておくことが大切です。",
      sortOrder: 1
    },
    "question-quiz-3": {
      quizId: "quiz-3",
      questionText: "復習の目的として正しいものはどれですか？",
      questionType: "multiple_choice",
      options: [
        { key: "A", text: "内容を忘れやすくする" },
        { key: "B", text: "理解を定着させる" },
        { key: "C", text: "記録を消す" },
        { key: "D", text: "順番を戻す" }
      ],
      correctAnswer: "B",
      explanation: "復習は理解の定着に役立ちます。",
      sortOrder: 1
    }
  }
} satisfies SeedDataShape;
