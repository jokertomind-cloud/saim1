import Link from "next/link";

const items = [
  { href: "/admin", label: "概要" },
  { href: "/admin/maps", label: "マップ" },
  { href: "/admin/points", label: "地点" },
  { href: "/admin/videos", label: "動画" },
  { href: "/admin/quizzes", label: "クイズ" },
  { href: "/admin/avatars", label: "アバター" },
  { href: "/admin/users", label: "ユーザー" }
];

export const AdminNav = () => (
  <div className="card">
    <div className="grid-3">
      {items.map((item) => (
        <Link className="button secondary" href={item.href} key={item.href}>
          {item.label}
        </Link>
      ))}
    </div>
  </div>
);
