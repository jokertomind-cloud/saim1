"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/providers/auth-provider";

export const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [loading, pathname, router, user]);

  if (loading) return <div className="panel">読み込み中...</div>;
  if (!user) return <div className="panel">ログイン画面へ移動しています...</div>;
  return <>{children}</>;
};

export const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuth();
  if (loading) return <div className="panel">読み込み中...</div>;
  if (profile?.role !== "admin") {
    return (
      <div className="panel stack">
        <h2>管理画面にアクセスできません</h2>
        <p>この画面は admin ユーザー専用です。</p>
        <Link className="button secondary" href="/dashboard">
          ダッシュボードへ戻る
        </Link>
      </div>
    );
  }
  return <>{children}</>;
};
