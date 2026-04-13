"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminNav } from "@/components/admin/admin-nav";
import { Field, TextArea, TextInput } from "@/components/ui/form";
import { deleteVideo, listPoints, listVideos, saveVideo } from "@/lib/services/admin-service";
import { parseCsvIds } from "@/lib/utils/strings";
import { videoSchema } from "@/lib/validators/forms";
import type { MapPoint, Video } from "@/types/models";

type FormValues = z.infer<typeof videoSchema> & { id: string };

export default function AdminVideosPage() {
  const [items, setItems] = useState<Array<{ id: string; data: Video }>>([]);
  const [points, setPoints] = useState<Array<{ id: string; data: MapPoint }>>([]);
  const [keyword, setKeyword] = useState("");
  const [genderFilter, setGenderFilter] = useState<Video["targetGender"] | "all-items">("all-items");
  const form = useForm<FormValues>({
    resolver: zodResolver(videoSchema.extend({ id: z.string().min(1) })),
    defaultValues: {
      id: "",
      title: "",
      description: "",
      youtubeUrl: "https://www.youtube.com/watch?v=",
      youtubeVideoId: "",
      mapPointId: "",
      level: 1,
      order: 0,
      requiredWatchCount: 1,
      targetGender: "all",
      prerequisiteVideoIds: "",
      prerequisiteQuizIds: "",
      prerequisiteLevel: null,
      playbackMode: "embed"
    }
  });

  const reload = () => listVideos().then(setItems);
  useEffect(() => {
    reload();
    listPoints().then(setPoints);
  }, []);

  const filteredItems = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    return items.filter((item) => {
      const matchesKeyword =
        !normalized ||
        [item.id, item.data.title, item.data.description, item.data.youtubeVideoId, item.data.mapPointId]
          .join(" ")
          .toLowerCase()
          .includes(normalized);
      const matchesGender = genderFilter === "all-items" || item.data.targetGender === genderFilter;
      return matchesKeyword && matchesGender;
    });
  }, [genderFilter, items, keyword]);

  const submit = form.handleSubmit(async (values) => {
    await saveVideo(values.id, {
      title: values.title,
      description: values.description,
      youtubeUrl: values.youtubeUrl,
      youtubeVideoId: values.youtubeVideoId,
      mapPointId: values.mapPointId,
      level: values.level,
      order: values.order,
      requiredWatchCount: values.requiredWatchCount,
      targetGender: values.targetGender,
      prerequisiteVideoIds: parseCsvIds(values.prerequisiteVideoIds),
      prerequisiteQuizIds: parseCsvIds(values.prerequisiteQuizIds),
      prerequisiteLevel: values.prerequisiteLevel || null,
      playbackMode: values.playbackMode,
      isPublished: true
    });
    reload();
    form.reset();
  });

  return (
    <div className="stack">
      <AdminNav />
      <section className="grid-2">
        <form className="card stack" onSubmit={submit}>
          <h2>動画 CRUD</h2>
          <Field error={form.formState.errors.id} label="ID">
            <TextInput registration={form.register("id")} />
          </Field>
          <Field error={form.formState.errors.title} label="タイトル">
            <TextInput registration={form.register("title")} />
          </Field>
          <Field error={form.formState.errors.description} label="説明">
            <TextArea registration={form.register("description")} />
          </Field>
          <Field error={form.formState.errors.mapPointId} label="地点">
            <select className="select" {...form.register("mapPointId")}>
              <option value="">選択してください</option>
              {points.map((point) => (
                <option key={point.id} value={point.id}>
                  {point.data.name}
                </option>
              ))}
            </select>
          </Field>
          <Field error={form.formState.errors.youtubeUrl} label="YouTube URL">
            <TextInput registration={form.register("youtubeUrl")} />
          </Field>
          <Field error={form.formState.errors.youtubeVideoId} label="YouTube videoId">
            <TextInput registration={form.register("youtubeVideoId")} />
          </Field>
          <div className="grid-3">
            <Field error={form.formState.errors.level} label="レベル">
              <TextInput registration={form.register("level")} type="number" />
            </Field>
            <Field error={form.formState.errors.order} label="順番">
              <TextInput registration={form.register("order")} type="number" />
            </Field>
            <Field error={form.formState.errors.requiredWatchCount} label="必須視聴回数">
              <TextInput registration={form.register("requiredWatchCount")} type="number" />
            </Field>
          </div>
          <Field error={form.formState.errors.targetGender} label="対象性別">
            <select className="select" {...form.register("targetGender")}>
              <option value="all">all</option>
              <option value="male">male</option>
              <option value="female">female</option>
              <option value="other">other</option>
            </select>
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
          <AdminListToolbar
            countLabel={`表示 ${filteredItems.length} / ${items.length}`}
            keyword={keyword}
            keywordPlaceholder="ID / タイトル / videoId / 地点"
            onKeywordChange={setKeyword}
            onSelectChange={(value) => setGenderFilter(value as Video["targetGender"] | "all-items")}
            selectLabel="対象性別"
            selectOptions={[
              { label: "すべて", value: "all-items" },
              { label: "all", value: "all" },
              { label: "male", value: "male" },
              { label: "female", value: "female" },
              { label: "other", value: "other" }
            ]}
            selectValue={genderFilter}
          />
          {filteredItems.map((item) => (
            <article className="panel stack" key={item.id}>
              <div className="split">
                <strong>{item.data.title}</strong>
                <div className="split">
                  <button
                    className="button secondary"
                    onClick={() =>
                      form.reset({
                        id: item.id,
                        title: item.data.title,
                        description: item.data.description,
                        youtubeUrl: item.data.youtubeUrl,
                        youtubeVideoId: item.data.youtubeVideoId,
                        mapPointId: item.data.mapPointId,
                        level: item.data.level,
                        order: item.data.order,
                        requiredWatchCount: item.data.requiredWatchCount,
                        targetGender: item.data.targetGender,
                        prerequisiteVideoIds: item.data.prerequisiteVideoIds.join(", "),
                        prerequisiteQuizIds: item.data.prerequisiteQuizIds.join(", "),
                        prerequisiteLevel: item.data.prerequisiteLevel,
                        playbackMode: item.data.playbackMode
                      })
                    }
                    type="button"
                  >
                    編集
                  </button>
                  <button className="button danger" onClick={() => deleteVideo(item.id).then(reload)} type="button">
                    削除
                  </button>
                </div>
              </div>
              <p>{item.data.description}</p>
              <p className="hint">
                性別: {item.data.targetGender} / レベル: {item.data.level} / 順番: {item.data.order}
              </p>
            </article>
          ))}
        </section>
      </section>
    </div>
  );
}
