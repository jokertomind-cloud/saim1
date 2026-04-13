import type { Timestamp } from "firebase/firestore";

export type Gender = "male" | "female" | "other";
export type TargetGender = "all" | Gender;
export type UserRole = "user" | "admin";
export type QuizQuestionType = "multiple_choice" | "true_false";
export type MapPointIconType = "video" | "quiz" | "goal" | "info";
export type FirestoreDateValue = Timestamp | Date | null;

export interface FirestoreMeta {
  createdAt?: FirestoreDateValue;
  updatedAt?: FirestoreDateValue;
}

export interface UserProfile extends FirestoreMeta {
  displayName: string;
  email: string;
  gender: Gender;
  avatarId: string;
  role: UserRole;
  lastLoginAt?: FirestoreDateValue;
}

export interface Avatar extends FirestoreMeta {
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export interface GameMap extends FirestoreMeta {
  name: string;
  description: string;
  width: number;
  height: number;
  tileSize: number;
  backgroundImageUrl: string | null;
  startX: number;
  startY: number;
  obstacles: Array<{ x: number; y: number }>;
  isActive: boolean;
  sortOrder: number;
}

export interface MapPoint extends FirestoreMeta {
  mapId: string;
  name: string;
  description: string;
  x: number;
  y: number;
  iconType: MapPointIconType;
  videoIds: string[];
  prerequisiteVideoIds: string[];
  prerequisiteQuizIds: string[];
  prerequisiteLevel: number | null;
  isActive: boolean;
  sortOrder: number;
}

export interface Video extends FirestoreMeta {
  title: string;
  description: string;
  youtubeUrl: string;
  youtubeVideoId: string;
  mapPointId: string;
  level: number;
  order: number;
  requiredWatchCount: number;
  targetGender: TargetGender;
  prerequisiteVideoIds: string[];
  prerequisiteQuizIds: string[];
  prerequisiteLevel: number | null;
  isPublished: boolean;
  playbackMode: "embed" | "external";
}

export interface Quiz extends FirestoreMeta {
  videoId: string;
  title: string;
  description: string;
  passingScore: number;
  isPublished: boolean;
}

export interface QuizQuestion extends FirestoreMeta {
  quizId: string;
  questionText: string;
  questionType: QuizQuestionType;
  options: Array<{ key: string; text: string }>;
  correctAnswer: string;
  explanation: string;
  sortOrder: number;
}

export interface UserProgress extends FirestoreMeta {
  currentLevel: number;
  unlockedVideoIds: string[];
  completedVideoIds: string[];
  passedQuizIds: string[];
  discoveredPointIds: string[];
  currentMapId: string | null;
  playerPosition: { mapId: string; x: number; y: number } | null;
}

export interface UserVideoStat extends FirestoreMeta {
  uid: string;
  videoId: string;
  watchCount: number;
  completedRequiredWatch: boolean;
  unlockedAt: FirestoreDateValue;
  firstWatchedAt: FirestoreDateValue;
  lastWatchedAt: FirestoreDateValue;
}

export interface UserQuizResult extends FirestoreMeta {
  uid: string;
  quizId: string;
  videoId: string;
  attempts: number;
  latestScore: number;
  passed: boolean;
  lastAnsweredAt: FirestoreDateValue;
  answerHistory: Array<{
    answeredAt: FirestoreDateValue;
    score: number;
    passed: boolean;
  }>;
}

export interface WithId<T> {
  id: string;
  data: T;
}

export interface AuthRegisterInput {
  displayName: string;
  gender: Gender;
  avatarId: string;
  email: string;
  password: string;
}

export interface ProfileInput {
  displayName: string;
  gender: Gender;
  avatarId: string;
}

export interface MapMoveInput {
  mapId: string;
  nextX: number;
  nextY: number;
}

export interface QuizSubmissionInput {
  quizId: string;
  videoId: string;
  answers: Record<string, string>;
}
