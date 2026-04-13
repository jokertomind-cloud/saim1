"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { ErrorState, LoadingState } from "@/components/ui/feedback";
import { loginWithEmail } from "@/lib/services/auth-service";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
      router.push(searchParams.get("redirect") || "/dashboard");
    } catch (nextError) {
      setError("ログインに失敗しました。メールアドレスまたはパスワードを確認してください。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container auth-wrap">
      <form className="card stack" onSubmit={submit}>
        <h1>ログイン</h1>
        <label className="field">
          <span>メールアドレス</span>
          <input className="input" onChange={(e) => setEmail(e.target.value)} type="email" value={email} />
        </label>
        <label className="field">
          <span>パスワード</span>
          <input className="input" onChange={(e) => setPassword(e.target.value)} type="password" value={password} />
        </label>
        {submitting ? <LoadingState label="ログイン中..." /> : null}
        {error ? <ErrorState message={error} /> : null}
        <button className="button" disabled={submitting} type="submit">
          ログイン
        </button>
        <Link className="button secondary" href="/reset-password">
          パスワード再設定
        </Link>
        <Link className="hint" href="/register">
          新規登録はこちら
        </Link>
      </form>
    </main>
  );
}
