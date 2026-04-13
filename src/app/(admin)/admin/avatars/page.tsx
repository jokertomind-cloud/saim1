"use client";

import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AdminNav } from "@/components/admin/admin-nav";
import { Field, TextInput } from "@/components/ui/form";
import { deleteAvatar, listAllAvatars, saveAvatar } from "@/lib/services/admin-service";
import { avatarSchema } from "@/lib/validators/forms";
import type { Avatar } from "@/types/models";

type FormValues = z.infer<typeof avatarSchema> & { id: string };

export default function AdminAvatarsPage() {
  const [items, setItems] = useState<Array<{ id: string; data: Avatar }>>([]);
  const form = useForm<FormValues>({
    resolver: zodResolver(avatarSchema.extend({ id: z.string().min(1) })),
    defaultValues: {
      id: "",
      name: "",
      imageUrl: "",
      thumbnailUrl: "",
      sortOrder: 0
    }
  });

  const reload = () => listAllAvatars().then(setItems);
  useEffect(() => {
    reload();
  }, []);

  const submit = form.handleSubmit(async (values) => {
    await saveAvatar(values.id, {
      name: values.name,
      imageUrl: values.imageUrl,
      thumbnailUrl: values.thumbnailUrl,
      sortOrder: values.sortOrder,
      isActive: true
    });
    reload();
    form.reset();
  });

  return (
    <div className="stack">
      <AdminNav />
      <section className="grid-2">
        <form className="card stack" onSubmit={submit}>
          <h2>アバター CRUD</h2>
          <Field error={form.formState.errors.id} label="ID">
            <TextInput registration={form.register("id")} />
          </Field>
          <Field error={form.formState.errors.name} label="名前">
            <TextInput registration={form.register("name")} />
          </Field>
          <Field error={form.formState.errors.imageUrl} label="画像URL">
            <TextInput registration={form.register("imageUrl")} />
          </Field>
          <Field error={form.formState.errors.thumbnailUrl} label="サムネイルURL">
            <TextInput registration={form.register("thumbnailUrl")} />
          </Field>
          <Field error={form.formState.errors.sortOrder} label="順番">
            <TextInput registration={form.register("sortOrder")} type="number" />
          </Field>
          <button className="button" type="submit">
            保存
          </button>
        </form>
        <section className="card stack">
          <h2>一覧</h2>
          {items.map((item) => (
            <article className="panel split" key={item.id}>
              <div className="split">
                <Image
                  alt={item.data.name}
                  height={48}
                  src={item.data.thumbnailUrl}
                  style={{ imageRendering: "pixelated" }}
                  unoptimized
                  width={48}
                />
                <div className="stack">
                  <strong>{item.data.name}</strong>
                  <span className="hint">{item.id}</span>
                </div>
              </div>
              <div className="split">
                <button
                  className="button secondary"
                  onClick={() =>
                    form.reset({
                      id: item.id,
                      name: item.data.name,
                      imageUrl: item.data.imageUrl,
                      thumbnailUrl: item.data.thumbnailUrl,
                      sortOrder: item.data.sortOrder
                    })
                  }
                  type="button"
                >
                  編集
                </button>
                <button className="button danger" onClick={() => deleteAvatar(item.id).then(reload)} type="button">
                  削除
                </button>
              </div>
            </article>
          ))}
        </section>
      </section>
    </div>
  );
}
