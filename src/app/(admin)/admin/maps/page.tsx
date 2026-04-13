"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AdminNav } from "@/components/admin/admin-nav";
import { ErrorState, SuccessState } from "@/components/ui/feedback";
import { Field, TextArea, TextInput } from "@/components/ui/form";
import { deleteMap, listMaps, saveMap } from "@/lib/services/admin-service";
import { mapSchema } from "@/lib/validators/forms";
import type { GameMap } from "@/types/models";

type FormValues = z.infer<typeof mapSchema> & { id: string; obstaclesText: string };

export default function AdminMapsPage() {
  const [items, setItems] = useState<Array<{ id: string; data: GameMap }>>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const form = useForm<FormValues>({
    resolver: zodResolver(mapSchema.extend({ id: z.string().min(1), obstaclesText: z.string().default("[]") })),
    defaultValues: {
      id: "main-map",
      name: "",
      description: "",
      width: 5,
      height: 5,
      tileSize: 56,
      startX: 0,
      startY: 0,
      sortOrder: 0,
      obstaclesText: "[]"
    }
  });

  const reload = () => listMaps().then(setItems);
  useEffect(() => {
    reload();
  }, []);

  const submit = form.handleSubmit(async (values) => {
    setMessage("");
    setError("");
    let obstacles: GameMap["obstacles"];
    try {
      const parsed = JSON.parse(values.obstaclesText || "[]") as unknown;
      if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "object" || item === null || !("x" in item) || !("y" in item))) {
        throw new Error("invalid-obstacles");
      }
      obstacles = parsed.map((item) => ({
        x: Number((item as { x: number }).x),
        y: Number((item as { y: number }).y)
      }));
    } catch {
      setError("障害物(JSON)は [{\"x\":1,\"y\":2}] の形式で入力してください。");
      return;
    }

    await saveMap(values.id, {
      name: values.name,
      description: values.description,
      width: values.width,
      height: values.height,
      tileSize: values.tileSize,
      backgroundImageUrl: null,
      startX: values.startX,
      startY: values.startY,
      obstacles,
      isActive: true,
      sortOrder: values.sortOrder
    });
    setMessage("マップを保存しました。");
    reload();
  });

  return (
    <div className="stack">
      <AdminNav />
      <section className="grid-2">
        <form className="card stack" onSubmit={submit}>
          <h2>マップ CRUD</h2>
          <Field error={form.formState.errors.id} label="ID">
            <TextInput registration={form.register("id")} />
          </Field>
          <Field error={form.formState.errors.name} label="名前">
            <TextInput registration={form.register("name")} />
          </Field>
          <Field error={form.formState.errors.description} label="説明">
            <TextArea registration={form.register("description")} />
          </Field>
          <div className="grid-2">
            <Field error={form.formState.errors.width} label="幅">
              <TextInput registration={form.register("width")} type="number" />
            </Field>
            <Field error={form.formState.errors.height} label="高さ">
              <TextInput registration={form.register("height")} type="number" />
            </Field>
          </div>
          <div className="grid-2">
            <Field error={form.formState.errors.startX} label="開始X">
              <TextInput registration={form.register("startX")} type="number" />
            </Field>
            <Field error={form.formState.errors.startY} label="開始Y">
              <TextInput registration={form.register("startY")} type="number" />
            </Field>
          </div>
          <Field label="障害物(JSON)">
            <TextArea registration={form.register("obstaclesText")} rows={5} />
          </Field>
          <button className="button" type="submit">
            保存
          </button>
          {message ? <SuccessState message={message} /> : null}
          {error ? <ErrorState message={error} /> : null}
        </form>
        <section className="card stack">
          <h2>一覧</h2>
          {items.map((item) => (
            <article className="panel stack" key={item.id}>
              <div className="split">
                <strong>{item.data.name}</strong>
                <div className="split">
                  <button
                    className="button secondary"
                    onClick={() =>
                      form.reset({
                        id: item.id,
                        name: item.data.name,
                        description: item.data.description,
                        width: item.data.width,
                        height: item.data.height,
                        tileSize: item.data.tileSize,
                        startX: item.data.startX,
                        startY: item.data.startY,
                        sortOrder: item.data.sortOrder,
                        obstaclesText: JSON.stringify(item.data.obstacles, null, 2)
                      })
                    }
                    type="button"
                  >
                    編集
                  </button>
                  <button className="button danger" onClick={() => deleteMap(item.id).then(reload)} type="button">
                    削除
                  </button>
                </div>
              </div>
              <p>{item.data.description}</p>
            </article>
          ))}
        </section>
      </section>
    </div>
  );
}
