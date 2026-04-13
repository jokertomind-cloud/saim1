"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { SimpleMap } from "@/components/map/simple-map";
import { ErrorState, LoadingState, SuccessState } from "@/components/ui/feedback";
import { VideoCard } from "@/components/video/video-card";
import { getMapById, listAccessiblePointVideos, listMapPoints, savePlayerPosition } from "@/lib/services/map-service";
import { getUserProgress } from "@/lib/services/user-service";
import { useAuth } from "@/providers/auth-provider";
import type { GameMap, MapPoint, UserProgress, Video, WithId } from "@/types/models";

export default function MapPage() {
  const params = useParams<{ mapId: string }>();
  const { user } = useAuth();
  const mapId = params.mapId ?? "main-map";
  const [map, setMap] = useState<GameMap | null>(null);
  const [points, setPoints] = useState<WithId<MapPoint>[]>([]);
  const [pointVideos, setPointVideos] = useState<WithId<Video>[]>([]);
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [currentPointId, setCurrentPointId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user || !mapId) return;
    setLoading(true);
    setError("");
    Promise.all([getMapById(mapId), listMapPoints(mapId), getUserProgress(user.uid)])
      .then(([mapItem, pointItems, progressItem]) => {
        setMap(mapItem);
        setPoints(pointItems);
        setProgress(progressItem);
      })
      .catch(() => setError("マップ情報の読み込みに失敗しました。再読み込みをお試しください。"))
      .finally(() => setLoading(false));
  }, [mapId, user]);

  const player = progress?.playerPosition && progress.playerPosition.mapId === mapId
    ? progress.playerPosition
    : map
      ? { mapId, x: map.startX, y: map.startY }
      : { mapId, x: 0, y: 0 };

  const currentPoint = useMemo(
    () => points.find((item) => item.id === currentPointId) ?? points.find((item) => item.data.x === player.x && item.data.y === player.y),
    [currentPointId, player.x, player.y, points]
  );

  useEffect(() => {
    const nextVideoIds = currentPoint?.data.videoIds ?? [];
    if (!nextVideoIds.length) {
      setPointVideos([]);
      return;
    }
    listAccessiblePointVideos(nextVideoIds, progress).then(setPointVideos);
  }, [currentPoint, progress]);

  const move = async (dx: number, dy: number) => {
    if (!map || !user || !progress) return;
    setMessage("");
    const nextX = player.x + dx;
    const nextY = player.y + dy;
    if (nextX < 0 || nextY < 0 || nextX >= map.width || nextY >= map.height) return;
    if (map.obstacles.some((item) => item.x === nextX && item.y === nextY)) return;
    const touched = points.find((item) => item.data.x === nextX && item.data.y === nextY);
    try {
      const updatedProgress = await savePlayerPosition(
        user.uid,
        progress,
        { mapId, nextX, nextY },
        touched?.id
      );
      setProgress(updatedProgress);
      if (touched) {
        setCurrentPointId(touched.id);
        setMessage(`「${touched.data.name}」に到達しました。`);
      }
    } catch {
      setError("移動結果の保存に失敗しました。");
    }
  };

  const handleCellTap = (x: number, y: number) => {
    const dx = x - player.x;
    const dy = y - player.y;
    if (Math.abs(dx) + Math.abs(dy) === 1) {
      void move(dx, dy);
    }
  };

  if (loading) return <LoadingState label="マップを読み込み中..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="grid-2 map-layout">
      <section className="card stack map-stage pwa-card">
        <h2>{map?.name ?? "マップ"}</h2>
        <p>{map?.description}</p>
        <p className="hint">現在地: ({player.x}, {player.y})</p>
        {message ? <SuccessState message={message} /> : null}
        {map ? (
          <SimpleMap
            map={map}
            onCellTap={handleCellTap}
            onMove={move}
            onPointTap={setCurrentPointId}
            playerX={player.x}
            playerY={player.y}
            points={points}
          />
        ) : null}
      </section>
      <section className="card stack map-detail">
        <h2>{currentPoint?.data.name ?? "地点を選択してください"}</h2>
        <p>{currentPoint?.data.description ?? "ポイントに触れると学習教材が開きます。"}</p>
        {pointVideos.map((video) => {
          const status = progress?.completedVideoIds.includes(video.id)
            ? "completed"
            : progress?.unlockedVideoIds.includes(video.id)
              ? "unlocked"
              : "locked";
          return <VideoCard key={video.id} status={status} video={video} />;
        })}
        {currentPoint && pointVideos.length < currentPoint.data.videoIds.length ? (
          <div className="panel stack">
            <strong>未解放の教材があります</strong>
            <p className="hint">前の動画の視聴回数やクイズ合格を満たすと、この地点の次の教材が見えるようになります。</p>
          </div>
        ) : null}
        <Link className="button secondary" href="/dashboard">
          ダッシュボードへ戻る
        </Link>
      </section>
    </div>
  );
}
