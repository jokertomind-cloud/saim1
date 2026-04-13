"use client";

import { useEffect, useState } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { getAdminSummary } from "@/lib/services/admin-service";

export default function AdminHomePage() {
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
        <p>`users.role` を暫定 admin 判定に使い、Firestore Rules でも admin のみ教材編集可能にします。</p>
        <p>本番では Firebase Admin SDK やカスタムクレームへ移行しやすいよう、判定責務は分離した構成で進めます。</p>
      </section>
    </div>
  );
}
