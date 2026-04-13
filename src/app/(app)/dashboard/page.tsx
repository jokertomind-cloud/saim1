"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ErrorState, LoadingState } from "@/components/ui/feedback";
import { VideoCard } from "@/components/video/video-card";
import { listUserVideoStats } from "@/lib/services/history-service";
import { getUserProgress } from "@/lib/services/user-service";
import { listVisibleVideos } from "@/lib/services/video-service";
import { useAuth } from "@/providers/auth-provider";
import type { UserProgress, Video, UserVideoStat, WithId } from "@/types/models";

export default function DashboardPage() {
  const { user } = useAuth();
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [videos, setVideos] = useState<Array<{ id: string; data: Video }>>([]);
  const [stats, setStats] = useState<WithId<UserVideoStat>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError("");
    Promise.all([getUserProgress(user.uid), listUserVideoStats(user.uid)])
      .then(async ([nextProgress, statsItems]) => {
        setProgress(nextProgress);
        const ids = Array.from(new Set([...(nextProgress?.unlockedVideoIds ?? []), ...(nextProgress?.completedVideoIds ?? [])]));
        const nextVideos = await listVisibleVideos(ids);
        setVideos(nextVideos);
        setStats(statsItems);
      })
      .catch(() => setError("ダッシュボード情報の取得に失敗しました。"))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingState label="学習状況を読み込み中..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="stack">
      <section className="card stack pwa-card">
        <p className="eyebrow">学習状況</p>
        <h2>{progress?.currentLevel ? `現在レベル ${progress.currentLevel}` : "進行状況を読み込み中"}</h2>
        <p>未解放の動画は一覧に出しすぎず、解放済み・再視聴可の教材だけを表示します。</p>
        <div className="split">
          <Link className="button" href="/map/main-map">
            マップを開く
          </Link>
          <Link className="button secondary" href="/history">
            学習履歴
          </Link>
        </div>
      </section>

      <section className="stack">
        <h2>解放済み教材</h2>
        <div className="grid-2">
          {videos.map((video) => {
            const watchCount = stats.find((item) => item.data.videoId === video.id)?.data.watchCount ?? 0;
            const status = progress?.completedVideoIds.includes(video.id)
              ? "completed"
              : progress?.unlockedVideoIds.includes(video.id)
                ? "unlocked"
                : "locked";
            return (
              <div key={video.id} className="stack">
                <VideoCard status={status} video={video} />
                <p className="hint">視聴回数 {watchCount} / {video.data.requiredWatchCount}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
