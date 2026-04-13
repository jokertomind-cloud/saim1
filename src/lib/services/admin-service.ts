import { getDocument, listOrderedCollection, removeDocument, saveDocument } from "@/lib/utils/firestore";
import type { Avatar, GameMap, MapPoint, Quiz, QuizQuestion, UserProgress, UserProfile, Video, WithId } from "@/types/models";

export const getAdminSummary = async () => {
  const [users, maps, points, videos, quizzes, avatars] = await Promise.all([
    listOrderedCollection<UserProfile>("users", "displayName"),
    listOrderedCollection<GameMap>("maps", "sortOrder"),
    listOrderedCollection<MapPoint>("mapPoints", "sortOrder"),
    listOrderedCollection<Video>("videos", "order"),
    listOrderedCollection<Quiz>("quizzes", "title"),
    listOrderedCollection<Avatar>("avatars", "sortOrder")
  ]);

  return {
    users: users.length,
    maps: maps.length,
    points: points.length,
    videos: videos.length,
    quizzes: quizzes.length,
    avatars: avatars.length
  };
};

export const listMaps = (): Promise<WithId<GameMap>[]> => listOrderedCollection<GameMap>("maps", "sortOrder");
export const listPoints = (): Promise<WithId<MapPoint>[]> => listOrderedCollection<MapPoint>("mapPoints", "sortOrder");
export const listVideos = (): Promise<WithId<Video>[]> => listOrderedCollection<Video>("videos", "order");
export const listQuizzes = (): Promise<WithId<Quiz>[]> => listOrderedCollection<Quiz>("quizzes", "title");
export const listAllAvatars = (): Promise<WithId<Avatar>[]> => listOrderedCollection<Avatar>("avatars", "sortOrder");

export const saveMap = (id: string, data: GameMap) => saveDocument<GameMap>("maps", id, data);
export const savePoint = (id: string, data: MapPoint) => saveDocument<MapPoint>("mapPoints", id, data);
export const saveVideo = (id: string, data: Video) => saveDocument<Video>("videos", id, data);
export const saveAvatar = (id: string, data: Avatar) => saveDocument<Avatar>("avatars", id, data);
export const saveQuiz = (id: string, data: Quiz) => saveDocument<Quiz>("quizzes", id, data);
export const saveQuizQuestion = (id: string, data: QuizQuestion) => saveDocument<QuizQuestion>("quizQuestions", id, data);

export const deleteMap = (id: string) => removeDocument("maps", id);
export const deletePoint = (id: string) => removeDocument("mapPoints", id);
export const deleteVideo = (id: string) => removeDocument("videos", id);
export const deleteAvatar = (id: string) => removeDocument("avatars", id);
export const deleteQuiz = (id: string) => removeDocument("quizzes", id);

export const getQuizQuestion = async (id: string): Promise<QuizQuestion | null> => {
  const question = await getDocument<QuizQuestion>("quizQuestions", id);
  return question?.data ?? null;
};

export const getUserProgressForAdmin = async (uid: string): Promise<UserProgress | null> => {
  const progress = await getDocument<UserProgress>("userProgress", uid);
  return progress?.data ?? null;
};
