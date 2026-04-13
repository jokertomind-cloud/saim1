"use client";

import Link from "next/link";
import { signOut } from "firebase/auth";
import { usePathname } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { useAuth } from "@/providers/auth-provider";

const navItems = [
  { href: "/dashboard", label: "ホーム", icon: "◉" },
  { href: "/map/main-map", label: "マップ", icon: "□" },
  { href: "/history", label: "履歴", icon: "△" },
  { href: "/profile", label: "プロフィール", icon: "◎" }
];

export const AppShell = ({
  children,
  admin = false
}: {
  children: React.ReactNode;
  admin?: boolean;
}) => {
  const { profile } = useAuth();
  const pathname = usePathname();

  return (
    <div className="app-root">
      <header className="topbar">
        <div>
          <p className="eyebrow">{admin ? "Admin" : "Learning Map"}</p>
          <h1>{admin ? "管理画面" : "ドット学習マップ"}</h1>
          {!admin ? <p className="hint">スマホで学びやすい PWA 風レイアウト</p> : null}
        </div>
        <div className="topbar-actions">
          {profile?.role === "admin" && !admin ? (
            <Link className="button secondary" href="/admin">
              管理
            </Link>
          ) : null}
          {!admin ? <span className="pill">{profile?.displayName ?? "ゲスト"}</span> : null}
          <button className="button ghost" onClick={() => signOut(auth)}>
            ログアウト
          </button>
        </div>
      </header>
      <main className="container">{children}</main>
      {!admin ? (
        <nav className="bottom-nav">
          {navItems.map((item) => (
            <Link
              key={item.href}
              className={pathname.startsWith(item.href) ? "bottom-link active" : "bottom-link"}
              href={item.href}
            >
              <span aria-hidden="true">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
};
