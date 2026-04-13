import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container auth-wrap">
      <section className="card hero stack">
        <p className="eyebrow">教育向け Web アプリ MVP</p>
        <h1>ドット絵アバターで学べる学習マップ</h1>
        <p>
          マップを移動して地点に触れ、学習動画を見てクイズに答えると次が解放されます。Firebase
          を中心にした構成で、スマホからそのまま使える設計です。
        </p>
        <div className="split">
          <Link className="button" href="/register">
            新規登録
          </Link>
          <Link className="button secondary" href="/login">
            ログイン
          </Link>
        </div>
      </section>
    </main>
  );
}
