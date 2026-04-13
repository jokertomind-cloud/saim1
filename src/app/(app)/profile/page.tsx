"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { ErrorState, SuccessState } from "@/components/ui/feedback";
import { Field, TextInput } from "@/components/ui/form";
import { listAllAvatars } from "@/lib/services/avatar-service";
import { updateUserProfile } from "@/lib/services/user-service";
import { profileSchema } from "@/lib/validators/forms";
import { useAuth } from "@/providers/auth-provider";
import type { Avatar } from "@/types/models";

type FormValues = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [avatars, setAvatars] = useState<Array<{ id: string; data: Avatar }>>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const form = useForm<FormValues>({
    resolver: zodResolver(profileSchema),
    values: {
      displayName: profile?.displayName ?? "",
      gender: profile?.gender ?? "other",
      avatarId: profile?.avatarId ?? ""
    }
  });

  useEffect(() => {
    listAllAvatars().then((items) => setAvatars(items));
  }, []);

  const submit = form.handleSubmit(async (values) => {
    if (!user) return;
    setMessage("");
    setError("");
    try {
      await updateUserProfile(user.uid, values);
      await refreshProfile();
      setMessage("プロフィールを更新しました。");
    } catch {
      setError("プロフィール更新に失敗しました。");
    }
  });

  return (
    <form className="stack" onSubmit={submit}>
      <section className="card stack">
        <h2>プロフィール</h2>
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
      </section>
      <section className="card stack">
        <h2>アバター</h2>
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
        {message ? <SuccessState message={message} /> : null}
        {error ? <ErrorState message={error} /> : null}
        <button className="button" type="submit">
          保存
        </button>
      </section>
    </form>
  );
}
