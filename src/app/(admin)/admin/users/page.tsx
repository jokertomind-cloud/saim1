"use client";

import { useMemo } from "react";
import { useEffect, useState } from "react";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminNav } from "@/components/admin/admin-nav";
import { getUserProgressForAdmin } from "@/lib/services/admin-service";
import { listUsers } from "@/lib/services/user-service";
import type { UserProfile, UserProgress } from "@/types/models";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Array<{ id: string; data: UserProfile }>>([]);
  const [selected, setSelected] = useState<{ id: string; progress: UserProgress | null } | null>(null);
  const [keyword, setKeyword] = useState("");

  useEffect(() => {
    listUsers().then(setUsers);
  }, []);

  const openProgress = async (uid: string) => {
    const progress = await getUserProgressForAdmin(uid);
    setSelected({ id: uid, progress });
  };

  const filteredUsers = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter((user) =>
      [user.id, user.data.displayName, user.data.email, user.data.role, user.data.gender]
        .join(" ")
        .toLowerCase()
        .includes(normalized)
    );
  }, [keyword, users]);

  return (
    <div className="stack">
      <AdminNav />
      <section className="grid-2">
        <div className="card stack">
          <h2>ユーザー一覧</h2>
          <AdminListToolbar
            countLabel={`表示 ${filteredUsers.length} / ${users.length}`}
            keyword={keyword}
            keywordPlaceholder="表示名 / email / uid / role"
            onKeywordChange={setKeyword}
          />
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>表示名</th>
                  <th>性別</th>
                  <th>role</th>
                  <th>進行度</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.data.displayName}</td>
                    <td>{user.data.gender}</td>
                    <td>{user.data.role}</td>
                    <td>
                      <button className="button secondary" onClick={() => openProgress(user.id)} type="button">
                        確認
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="card stack">
          <h2>進行度詳細</h2>
          {selected?.progress ? (
            <>
              <p>uid: {selected.id}</p>
              <p>現在レベル: {selected.progress.currentLevel}</p>
              <p>現在マップ: {selected.progress.currentMapId ?? "-"}</p>
              <p>
                現在位置:{" "}
                {selected.progress.playerPosition
                  ? `${selected.progress.playerPosition.mapId} (${selected.progress.playerPosition.x}, ${selected.progress.playerPosition.y})`
                  : "-"}
              </p>
              <p>解放済み動画: {selected.progress.unlockedVideoIds.join(", ") || "-"}</p>
              <p>完了動画: {selected.progress.completedVideoIds.join(", ") || "-"}</p>
              <p>合格クイズ: {selected.progress.passedQuizIds.join(", ") || "-"}</p>
              <p>到達地点: {selected.progress.discoveredPointIds.join(", ") || "-"}</p>
            </>
          ) : (
            <p>ユーザーを選ぶと進行度を表示します。</p>
          )}
        </div>
      </section>
    </div>
  );
}
