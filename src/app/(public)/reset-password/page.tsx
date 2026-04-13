"use client";

import { useState } from "react";
import { ErrorState, LoadingState, SuccessState } from "@/components/ui/feedback";
import { requestPasswordReset } from "@/lib/services/auth-service";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await requestPasswordReset(email);
      setMessage("再設定メールを送信しました。");
    } catch {
      setError("メール送信に失敗しました。");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="container auth-wrap">
      <form className="card stack" onSubmit={submit}>
        <h1>パスワード再設定</h1>
        <label className="field">
          <span>メールアドレス</span>
          <input className="input" onChange={(e) => setEmail(e.target.value)} type="email" value={email} />
        </label>
        {submitting ? <LoadingState label="送信中..." /> : null}
        {message ? <SuccessState message={message} /> : null}
        {error ? <ErrorState message={error} /> : null}
        <button className="button" disabled={submitting} type="submit">
          送信
        </button>
      </form>
    </main>
  );
}
