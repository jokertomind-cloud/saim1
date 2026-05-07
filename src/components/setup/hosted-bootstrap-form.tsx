"use client";

import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ErrorState, LoadingState, SuccessState } from "@/components/ui/feedback";
import { Field, TextInput } from "@/components/ui/form";
import { setupBootstrapSchema } from "@/lib/validators/forms";

type FormValues = z.infer<typeof setupBootstrapSchema>;

const setupAvatars = [
  { id: "avatar-boy-01", name: "ブルー", imageUrl: "/avatars/avatar-boy-01.svg" },
  { id: "avatar-girl-01", name: "ピンク", imageUrl: "/avatars/avatar-girl-01.svg" },
  { id: "avatar-neutral-01", name: "グリーン", imageUrl: "/avatars/avatar-neutral-01.svg" }
] as const;

export const HostedBootstrapForm = () => {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(setupBootstrapSchema),
    defaultValues: {
      setupToken: "",
      displayName: "管理者",
      gender: "other",
      avatarId: setupAvatars[0].id,
      email: "",
      password: ""
    }
  });

  const submit = form.handleSubmit(async (values) => {
    setError("");
    setMessage("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/setup/bootstrap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(values)
      });

      const payload = (await response.json()) as { ok: boolean; message?: string };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "初回セットアップに失敗しました。");
      }

      setMessage(payload.message ?? "初回セットアップが完了しました。");
      form.reset({
        ...values,
        password: "",
        setupToken: ""
      });
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "初回セットアップに失敗しました。");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form className="card stack" onSubmit={submit}>
      <h1>初回セットアップ</h1>
      <p>
        Firebase App Hosting にデプロイした直後に、初期データ投入と最初の管理者アカウント作成をまとめて実行します。
      </p>
      <Field error={form.formState.errors.setupToken} label="セットアップトークン">
        <TextInput placeholder="App Hosting に設定した APP_SETUP_TOKEN" registration={form.register("setupToken")} />
      </Field>
      <Field error={form.formState.errors.displayName} label="最初の管理者表示名">
        <TextInput registration={form.register("displayName")} />
      </Field>
      <Field error={form.formState.errors.gender} label="最初の管理者性別">
        <select className="select" {...form.register("gender")}>
          <option value="male">male</option>
          <option value="female">female</option>
          <option value="other">other</option>
        </select>
      </Field>
      <div className="field">
        <span>最初の管理者アバター</span>
        <div className="avatar-list">
          {setupAvatars.map((avatar) => (
            <button
              className={form.watch("avatarId") === avatar.id ? "avatar-card selected" : "avatar-card"}
              key={avatar.id}
              onClick={() => form.setValue("avatarId", avatar.id, { shouldValidate: true })}
              type="button"
            >
              <Image alt={avatar.name} height={56} src={avatar.imageUrl} unoptimized width={56} />
              <strong>{avatar.name}</strong>
            </button>
          ))}
        </div>
        {form.formState.errors.avatarId ? <small className="error-text">{form.formState.errors.avatarId.message}</small> : null}
      </div>
      <Field error={form.formState.errors.email} label="最初の管理者メールアドレス">
        <TextInput registration={form.register("email")} type="email" />
      </Field>
      <Field error={form.formState.errors.password} label="最初の管理者パスワード">
        <TextInput registration={form.register("password")} type="password" />
      </Field>
      {submitting ? <LoadingState label="初回セットアップを実行中..." /> : null}
      {message ? <SuccessState message={message} /> : null}
      {error ? <ErrorState message={error} /> : null}
      <button className="button" disabled={submitting} type="submit">
        初期データ投入と管理者作成をまとめて実行
      </button>
    </form>
  );
};
