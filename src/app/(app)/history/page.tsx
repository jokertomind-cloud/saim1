"use client";

import { useEffect, useState } from "react";
import { ErrorState, LoadingState } from "@/components/ui/feedback";
import { listUserQuizResults, listUserVideoStats } from "@/lib/services/history-service";
import { toDateLabel } from "@/lib/utils/firestore";
import { useAuth } from "@/providers/auth-provider";
import type { UserQuizResult, UserVideoStat, WithId } from "@/types/models";

export default function HistoryPage() {
  const { user } = useAuth();
  const [videoStats, setVideoStats] = useState<WithId<UserVideoStat>[]>([]);
  const [quizResults, setQuizResults] = useState<WithId<UserQuizResult>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError("");
    Promise.all([listUserVideoStats(user.uid), listUserQuizResults(user.uid)])
      .then(([videoItems, quizItems]) => {
        setVideoStats(videoItems);
        setQuizResults(quizItems);
      })
      .catch(() => setError("履歴の取得に失敗しました。"))
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <LoadingState label="履歴を読み込み中..." />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="grid-2">
      <section className="card stack">
        <h2>動画履歴</h2>
        {videoStats.map((item) => (
          <article className="panel stack" key={item.id}>
            <strong>{item.data.videoId}</strong>
            <p>視聴回数: {item.data.watchCount}</p>
            <p>最終視聴: {toDateLabel(item.data.lastWatchedAt)}</p>
          </article>
        ))}
      </section>
      <section className="card stack">
        <h2>クイズ履歴</h2>
        {quizResults.map((item) => (
          <article className="panel stack" key={item.id}>
            <strong>{item.data.quizId}</strong>
            <p>最新スコア: {item.data.latestScore}</p>
            <p>判定: {item.data.passed ? "合格" : "未合格"}</p>
            <p>最終回答: {toDateLabel(item.data.lastAnsweredAt)}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
