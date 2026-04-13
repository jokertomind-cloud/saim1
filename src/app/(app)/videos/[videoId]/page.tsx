"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ErrorState, LoadingState, SuccessState } from "@/components/ui/feedback";
import { getUnlockedVideoBundle, recordVideoWatch } from "@/lib/services/video-service";
import { useAuth } from "@/providers/auth-provider";
import type { Quiz, UserProgress, Video, WithId } from "@/types/models";

export default function VideoPage() {
  const params = useParams<{ videoId: string }>();
  const { user, profile } = useAuth();
  const videoId = params.videoId ?? "";
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [video, setVideo] = useState<Video | null>(null);
  const [quizzes, setQuizzes] = useState<WithId<Quiz>[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !videoId) return;
    setLoading(true);
    setError("");
    getUnlockedVideoBundle(user.uid, videoId)
      .then(({ progress: nextProgress, video: nextVideo, quizzes: nextQuizzes }) => {
        setProgress(nextProgress);
        setVideo(nextVideo);
        setQuizzes(nextQuizzes);
      })
      .catch(() => setError("動画情報の取得に失敗しました。"))
      .finally(() => setLoading(false));
  }, [user, videoId]);

  const markWatched = async () => {
    if (!user || !video || !progress) return;
    setError("");
    setMessage("");
    try {
      const nextProgress = await recordVideoWatch({
        uid: user.uid,
        videoId,
        video,
        progress,
        userGender: profile?.gender ?? "other"
      });
      setProgress(nextProgress);
      setMessage("視聴回数を更新しました。");
    } catch {
      setError("視聴記録の保存に失敗しました。");
    }
  };

  if (loading) return <LoadingState label="動画を読み込み中..." />;
  if (error) return <ErrorState message={error} />;

  if (progress && !progress.unlockedVideoIds.includes(videoId) && !progress.completedVideoIds.includes(videoId)) {
    return (
      <section className="card stack">
        <h2>未解放の動画です</h2>
        <p>条件達成前は動画情報を取得しない設計です。先に前の動画やクイズを進めてください。</p>
      </section>
    );
  }

  if (!video) return <section className="card">動画が見つかりません。</section>;

  return (
    <div className="stack">
      <section className="card stack">
        <div className="split">
          <div>
            <p className="eyebrow">解放済み教材</p>
            <h2>{video.title}</h2>
          </div>
          <span className={progress?.completedVideoIds.includes(videoId) ? "status completed" : "status unlocked"}>
            {progress?.completedVideoIds.includes(videoId) ? "再視聴可" : "解放済み"}
          </span>
        </div>
        <p>{video.description}</p>
        {video.playbackMode === "embed" ? (
          <div className="card">
            <iframe
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              src={`https://www.youtube.com/embed/${video.youtubeVideoId}`}
              style={{ width: "100%", minHeight: 240, border: 0, borderRadius: 16 }}
              title={video.title}
            />
          </div>
        ) : (
          <a className="button" href={video.youtubeUrl} rel="noreferrer" target="_blank">
            動画を開く
          </a>
        )}
        <button className="button" onClick={markWatched} type="button">
          視聴完了として記録
        </button>
        {message ? <SuccessState message={message} /> : null}
        {quizzes[0] ? (
          <Link className="button secondary" href={`/videos/${videoId}/quiz`}>
            クイズへ進む
          </Link>
        ) : null}
      </section>
    </div>
  );
}
