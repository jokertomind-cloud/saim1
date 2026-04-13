import Link from "next/link";
import type { Video, WithId } from "@/types/models";

export const VideoCard = ({
  video,
  status
}: {
  video: WithId<Video>;
  status: "locked" | "unlocked" | "completed";
}) => (
  <article className="card stack">
    <div className="split">
      <div>
        <p className="eyebrow">Lv.{video.data.level}</p>
        <h3>{video.data.title}</h3>
      </div>
      <span className={`status ${status}`}>{status === "locked" ? "未解放" : status === "completed" ? "再視聴可" : "解放済み"}</span>
    </div>
    <p>{video.data.description}</p>
    {status === "locked" ? (
      <p className="hint">条件達成後に詳細を取得します。</p>
    ) : (
      <Link className="button" href={`/videos/${video.id}`}>
        動画を見る
      </Link>
    )}
  </article>
);
