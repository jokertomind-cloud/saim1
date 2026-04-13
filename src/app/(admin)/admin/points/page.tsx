"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AdminNav } from "@/components/admin/admin-nav";
import { Field, TextArea, TextInput } from "@/components/ui/form";
import { deletePoint, listMaps, listPoints, savePoint } from "@/lib/services/admin-service";
import { parseCsvIds } from "@/lib/utils/strings";
import { mapPointSchema } from "@/lib/validators/forms";
import type { GameMap, MapPoint } from "@/types/models";

type FormValues = z.infer<typeof mapPointSchema> & { id: string };

export default function AdminPointsPage() {
  const [items, setItems] = useState<Array<{ id: string; data: MapPoint }>>([]);
  const [maps, setMaps] = useState<Array<{ id: string; data: GameMap }>>([]);
  const form = useForm<FormValues>({
    resolver: zodResolver(mapPointSchema.extend({ id: z.string().min(1) })),
    defaultValues: {
      id: "",
      mapId: "main-map",
      name: "",
      description: "",
      x: 0,
      y: 0,
      iconType: "video",
      prerequisiteVideoIds: "",
      prerequisiteQuizIds: "",
      prerequisiteLevel: null,
      videoIds: "",
      sortOrder: 0
    }
  });

  const reload = () => listPoints().then(setItems);

  useEffect(() => {
    reload();
    listMaps().then(setMaps);
  }, []);

  const submit = form.handleSubmit(async (values) => {
    await savePoint(values.id, {
      mapId: values.mapId,
      name: values.name,
      description: values.description,
      x: values.x,
      y: values.y,
      iconType: values.iconType,
      videoIds: parseCsvIds(values.videoIds),
      prerequisiteVideoIds: parseCsvIds(values.prerequisiteVideoIds),
      prerequisiteQuizIds: parseCsvIds(values.prerequisiteQuizIds),
      prerequisiteLevel: values.prerequisiteLevel || null,
      isActive: true,
      sortOrder: values.sortOrder
    });
    reload();
    form.reset();
  });

  return (
    <div className="stack">
      <AdminNav />
      <section className="grid-2">
        <form className="card stack" onSubmit={submit}>
          <h2>地点 CRUD</h2>
          <Field error={form.formState.errors.id} label="ID">
            <TextInput registration={form.register("id")} />
          </Field>
          <Field error={form.formState.errors.mapId} label="マップ">
            <select className="select" {...form.register("mapId")}>
              {maps.map((map) => (
                <option key={map.id} value={map.id}>
                  {map.data.name}
                </option>
              ))}
            </select>
          </Field>
          <Field error={form.formState.errors.name} label="地点名">
            <TextInput registration={form.register("name")} />
          </Field>
          <Field error={form.formState.errors.description} label="説明">
            <TextArea registration={form.register("description")} />
          </Field>
          <div className="grid-2">
            <Field error={form.formState.errors.x} label="X">
              <TextInput registration={form.register("x")} type="number" />
            </Field>
            <Field error={form.formState.errors.y} label="Y">
              <TextInput registration={form.register("y")} type="number" />
            </Field>
          </div>
          <Field error={form.formState.errors.iconType} label="種類">
            <select className="select" {...form.register("iconType")}>
              <option value="video">video</option>
              <option value="quiz">quiz</option>
              <option value="goal">goal</option>
              <option value="info">info</option>
            </select>
          </Field>
          <Field label="紐づく動画ID(csv)">
            <TextInput registration={form.register("videoIds")} />
          </Field>
          <Field label="前提動画ID(csv)">
            <TextInput registration={form.register("prerequisiteVideoIds")} />
          </Field>
          <Field label="前提クイズID(csv)">
            <TextInput registration={form.register("prerequisiteQuizIds")} />
          </Field>
          <button className="button" type="submit">
            保存
          </button>
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
                        mapId: item.data.mapId,
                        name: item.data.name,
                        description: item.data.description,
                        x: item.data.x,
                        y: item.data.y,
                        iconType: item.data.iconType,
                        videoIds: item.data.videoIds.join(", "),
                        prerequisiteVideoIds: item.data.prerequisiteVideoIds.join(", "),
                        prerequisiteQuizIds: item.data.prerequisiteQuizIds.join(", "),
                        prerequisiteLevel: item.data.prerequisiteLevel,
                        sortOrder: item.data.sortOrder
                      })
                    }
                    type="button"
                  >
                    編集
                  </button>
                  <button className="button danger" onClick={() => deletePoint(item.id).then(reload)} type="button">
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
