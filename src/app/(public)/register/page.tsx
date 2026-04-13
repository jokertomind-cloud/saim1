"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ErrorState, LoadingState, SuccessState } from "@/components/ui/feedback";
import { Field, TextInput } from "@/components/ui/form";
import { listActiveAvatars } from "@/lib/services/avatar-service";
import { registerUserAccount } from "@/lib/services/auth-service";
import { registerSchema } from "@/lib/validators/forms";
import type { Avatar } from "@/types/models";
import { z } from "zod";

type FormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [avatars, setAvatars] = useState<Array<{ id: string; data: Avatar }>>([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const form = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      displayName: "",
      gender: "other",
      avatarId: "",
      email: "",
      password: ""
    }
  });

  useEffect(() => {
    listActiveAvatars().then((items) => {
      setAvatars(items);
      if (items[0]) form.setValue("avatarId", items[0].id);
    });
  }, [form]);

  const submit = form.handleSubmit(async (values) => {
    setError("");
    setMessage("");
    setSubmitting(true);
    try {
      await registerUserAccount(values);
      setMessage("登録が完了しました。ダッシュボードへ移動します。");
      router.push("/dashboard");
    } catch {
      setError("登録に失敗しました。入力内容を確認してください。");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <main className="container auth-wrap">
      <form className="card stack" onSubmit={submit}>
        <h1>新規登録</h1>
        <Field error={form.formState.errors.displayName} label="表示名">
          <TextInput registration={form.register("displayName")} />
        </Field>
        <Field error={form.formState.errors.gender} label="性別">
          <select className="select" {...form.register("gender")}>
            <option value="male">male</option>
            <option value="female">female</option>
            <option value="other">other</option>
          </select>
        </Field>
        <div className="field">
          <span>初期アバター</span>
          <div className="avatar-list">
            {avatars.map((avatar) => (
              <button
                className={form.watch("avatarId") === avatar.id ? "avatar-card selected" : "avatar-card"}
                key={avatar.id}
                onClick={() => form.setValue("avatarId", avatar.id)}
                type="button"
              >
                <img alt={avatar.data.name} src={avatar.data.thumbnailUrl} />
                <strong>{avatar.data.name}</strong>
              </button>
            ))}
          </div>
          {form.formState.errors.avatarId ? (
            <small className="error-text">{form.formState.errors.avatarId.message}</small>
          ) : null}
        </div>
        <Field error={form.formState.errors.email} label="メールアドレス">
          <TextInput registration={form.register("email")} type="email" />
        </Field>
        <Field error={form.formState.errors.password} label="パスワード">
          <TextInput registration={form.register("password")} type="password" />
        </Field>
        {submitting ? <LoadingState label="登録中..." /> : null}
        {message ? <SuccessState message={message} /> : null}
        {error ? <ErrorState message={error} /> : null}
        <button className="button" disabled={submitting} type="submit">
          登録する
        </button>
      </form>
    </main>
  );
}
