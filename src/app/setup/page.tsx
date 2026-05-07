import type { Metadata } from "next";
import { HostedBootstrapForm } from "@/components/setup/hosted-bootstrap-form";

export const metadata: Metadata = {
  title: "初回セットアップ",
  robots: {
    index: false,
    follow: false
  }
};

export default function SetupPage() {
  return (
    <main className="container auth-wrap">
      <div className="stack">
        <HostedBootstrapForm />
        <section className="card stack">
          <h2>使い方</h2>
          <p>1. Firebase Console で Auth と Firestore を有効化します。</p>
          <p>2. App Hosting の環境変数またはシークレットに `APP_SETUP_TOKEN` を設定します。</p>
          <p>3. この画面でトークンと最初の管理者情報を入力し、ボタンを1回押します。</p>
          <p>4. 完了後はトップ画面から作成した管理者でログインし、`/admin` を開きます。</p>
          <p>5. 成功したら `APP_SETUP_TOKEN` を別の値へ更新して保管し、同じトークンを使い続けないようにします。</p>
        </section>
      </div>
    </main>
  );
}
