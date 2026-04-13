import { getDocument, getDocumentsByIds, listCollection, patchDocument } from "@/lib/utils/firestore";
import type { GameMap, MapMoveInput, MapPoint, UserProgress, Video, WithId } from "@/types/models";

export const getMapById = async (mapId: string): Promise<GameMap | null> => {
  const map = await getDocument<GameMap>("maps", mapId);
  return map?.data ?? null;
};

export const listMapPoints = async (mapId: string): Promise<WithId<MapPoint>[]> => {
  const points = await listCollection<MapPoint>("mapPoints", "mapId", mapId);
  return points.sort((a, b) => a.data.sortOrder - b.data.sortOrder);
};

export const listAccessiblePointVideos = async (
  videoIds: string[],
  progress: UserProgress | null
): Promise<WithId<Video>[]> => {
  const accessibleIds = videoIds.filter(
    (id) => progress?.unlockedVideoIds.includes(id) || progress?.completedVideoIds.includes(id)
  );
  if (!accessibleIds.length) return [];
  const videos = await getDocumentsByIds<Video>("videos", accessibleIds);
  return videos.sort((a, b) => a.data.order - b.data.order);
};

export const savePlayerPosition = async (
  uid: string,
  currentProgress: UserProgress,
  move: MapMoveInput,
  touchedPointId?: string
): Promise<UserProgress> => {
  const discovered = new Set(currentProgress.discoveredPointIds);
  if (touchedPointId) discovered.add(touchedPointId);

  const nextProgress: Partial<UserProgress> = {
    playerPosition: {
      mapId: move.mapId,
      x: move.nextX,
      y: move.nextY
    },
    discoveredPointIds: Array.from(discovered)
  };

  await patchDocument<UserProgress>("userProgress", uid, nextProgress);

  return {
    ...currentProgress,
    ...nextProgress
  };
};
