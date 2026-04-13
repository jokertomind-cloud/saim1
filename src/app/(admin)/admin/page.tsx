"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { getAdminSummary } from "@/lib/services/admin-service";
import { useAuth } from "@/providers/auth-provider";

export default function AdminHomePage() {
  const { adminAccess } = useAuth();
  const [counts, setCounts] = useState({
    users: 0,
    maps: 0,
    points: 0,
    videos: 0,
    quizzes: 0,
    avatars: 0
  });

  useEffect(() => {
    getAdminSummary().then(setCounts);
  }, []);

  return (
    <div className="stack">
      <AdminNav />
      <section className="grid-3">
        {Object.entries(counts).map(([key, value]) => (
          <article className="card stack" key={key}>
            <p className="eyebrow">{key}</p>
            <h2>{value}</h2>
          </article>
        ))}
      </section>
      <section className="card stack">
        <h2>管理方針</h2>
        <p>現在の admin 判定ソース: {adminAccess.source}</p>
        <p>実装は `Custom Claims 優先 / users.role フォールバック` です。Firestore Rules でも admin のみ教材編集可能にしています。</p>
        <p>本番では Firebase Admin SDK 経由の claims 付与を正本にし、`users.role` は運用表示用の補助に寄せる方針です。</p>
      </section>
      <section className="card stack">
        <h2>運用メモ</h2>
        <p>短期は admin 付与スクリプトと検索付き一覧で運用負荷を下げ、中期で Cloud Functions と共通フォーム化へ進めます。</p>
        <p>詳しい計画は `docs/PRODUCTION_HARDENING_PLAN.md` と `docs/OPERATIONS_PLAN.md` に整理しています。</p>
      </section>
    </div>
  );
}
