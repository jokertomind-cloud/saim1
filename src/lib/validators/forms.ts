import { z } from "zod";

export const registerSchema = z.object({
  displayName: z.string().min(2, "表示名は2文字以上で入力してください"),
  gender: z.enum(["male", "female", "other"]),
  avatarId: z.string().min(1, "アバターを選択してください"),
  email: z.string().email("メールアドレスの形式が不正です"),
  password: z.string().min(6, "パスワードは6文字以上にしてください")
});

export const profileSchema = z.object({
  displayName: z.string().min(2),
  gender: z.enum(["male", "female", "other"]),
  avatarId: z.string().min(1)
});

export const mapSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  width: z.coerce.number().int().min(3),
  height: z.coerce.number().int().min(3),
  tileSize: z.coerce.number().int().min(32),
  startX: z.coerce.number().int().min(0),
  startY: z.coerce.number().int().min(0),
  sortOrder: z.coerce.number().int().min(0)
});

export const mapPointSchema = z.object({
  mapId: z.string().min(1),
  name: z.string().min(1),
  description: z.string().min(1),
  x: z.coerce.number().int().min(0),
  y: z.coerce.number().int().min(0),
  iconType: z.enum(["video", "quiz", "goal", "info"]),
  prerequisiteVideoIds: z.string().default(""),
  prerequisiteQuizIds: z.string().default(""),
  prerequisiteLevel: z.coerce.number().int().min(0).nullable().optional(),
  videoIds: z.string().default(""),
  sortOrder: z.coerce.number().int().min(0)
});

export const videoSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  youtubeUrl: z.string().url(),
  youtubeVideoId: z.string().min(1),
  mapPointId: z.string().min(1),
  level: z.coerce.number().int().min(1),
  order: z.coerce.number().int().min(0),
  requiredWatchCount: z.coerce.number().int().min(1),
  targetGender: z.enum(["all", "male", "female", "other"]),
  prerequisiteVideoIds: z.string().default(""),
  prerequisiteQuizIds: z.string().default(""),
  prerequisiteLevel: z.coerce.number().int().min(0).nullable().optional(),
  playbackMode: z.enum(["embed", "external"])
});

export const quizSchema = z.object({
  videoId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  passingScore: z.coerce.number().int().min(1).max(100),
  questionText: z.string().min(1),
  questionType: z.enum(["multiple_choice", "true_false"]),
  optionA: z.string().min(1),
  optionB: z.string().min(1),
  optionC: z.string().optional(),
  optionD: z.string().optional(),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(1)
});

export const avatarSchema = z.object({
  name: z.string().min(1),
  imageUrl: z.string().min(1),
  thumbnailUrl: z.string().min(1),
  sortOrder: z.coerce.number().int().min(0)
});
