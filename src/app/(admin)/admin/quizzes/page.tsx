"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMemo } from "react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { AdminListToolbar } from "@/components/admin/admin-list-toolbar";
import { AdminNav } from "@/components/admin/admin-nav";
import { Field, TextArea, TextInput } from "@/components/ui/form";
import { deleteQuiz, getQuizQuestion, listQuizzes, listVideos, saveQuiz, saveQuizQuestion } from "@/lib/services/admin-service";
import { quizSchema } from "@/lib/validators/forms";
import type { Quiz, Video } from "@/types/models";

type FormValues = z.infer<typeof quizSchema> & { quizId: string; questionId: string };

export default function AdminQuizzesPage() {
  const [items, setItems] = useState<Array<{ id: string; data: Quiz }>>([]);
  const [videos, setVideos] = useState<Array<{ id: string; data: Video }>>([]);
  const [keyword, setKeyword] = useState("");
  const form = useForm<FormValues>({
    resolver: zodResolver(quizSchema.extend({ quizId: z.string().min(1), questionId: z.string().min(1) })),
    defaultValues: {
      quizId: "",
      questionId: "",
      videoId: "",
      title: "",
      description: "",
      passingScore: 100,
      questionText: "",
      questionType: "multiple_choice",
      optionA: "",
      optionB: "",
      optionC: "",
      optionD: "",
      correctAnswer: "A",
      explanation: ""
    }
  });

  const reload = () => listQuizzes().then(setItems);
  useEffect(() => {
    reload();
    listVideos().then(setVideos);
  }, []);

  const filteredItems = useMemo(() => {
    const normalized = keyword.trim().toLowerCase();
    if (!normalized) return items;
    return items.filter((item) =>
      [item.id, item.data.title, item.data.description, item.data.videoId].join(" ").toLowerCase().includes(normalized)
    );
  }, [items, keyword]);

  const submit = form.handleSubmit(async (values) => {
    await saveQuiz(values.quizId, {
      videoId: values.videoId,
      title: values.title,
      description: values.description,
      passingScore: values.passingScore,
      isPublished: true
    });
    const options =
      values.questionType === "true_false"
        ? [
            { key: "A", text: "○" },
            { key: "B", text: "×" }
          ]
        : [
            { key: "A", text: values.optionA },
            { key: "B", text: values.optionB },
            { key: "C", text: values.optionC || "" },
            { key: "D", text: values.optionD || "" }
          ].filter((item) => item.text);
    await saveQuizQuestion(values.questionId, {
      quizId: values.quizId,
      questionText: values.questionText,
      questionType: values.questionType,
      options,
      correctAnswer: values.correctAnswer,
      explanation: values.explanation,
      sortOrder: 0
    });
    reload();
    form.reset();
  });

  return (
    <div className="stack">
      <AdminNav />
      <section className="grid-2">
        <form className="card stack" onSubmit={submit}>
          <h2>クイズ CRUD</h2>
          <Field error={form.formState.errors.quizId} label="クイズID">
            <TextInput registration={form.register("quizId")} />
          </Field>
          <Field error={form.formState.errors.questionId} label="問題ID">
            <TextInput registration={form.register("questionId")} />
          </Field>
          <Field error={form.formState.errors.videoId} label="対象動画">
            <select className="select" {...form.register("videoId")}>
              <option value="">選択してください</option>
              {videos.map((video) => (
                <option key={video.id} value={video.id}>
                  {video.data.title}
                </option>
              ))}
            </select>
          </Field>
          <Field error={form.formState.errors.title} label="タイトル">
            <TextInput registration={form.register("title")} />
          </Field>
          <Field error={form.formState.errors.description} label="説明">
            <TextArea registration={form.register("description")} />
          </Field>
          <Field error={form.formState.errors.passingScore} label="合格点">
            <TextInput registration={form.register("passingScore")} type="number" />
          </Field>
          <Field error={form.formState.errors.questionType} label="問題形式">
            <select className="select" {...form.register("questionType")}>
              <option value="multiple_choice">4択</option>
              <option value="true_false">○×</option>
            </select>
          </Field>
          <Field error={form.formState.errors.questionText} label="問題文">
            <TextArea registration={form.register("questionText")} />
          </Field>
          <div className="grid-2">
            <Field error={form.formState.errors.optionA} label="選択肢A">
              <TextInput registration={form.register("optionA")} />
            </Field>
            <Field error={form.formState.errors.optionB} label="選択肢B">
              <TextInput registration={form.register("optionB")} />
            </Field>
            <Field label="選択肢C">
              <TextInput registration={form.register("optionC")} />
            </Field>
            <Field label="選択肢D">
              <TextInput registration={form.register("optionD")} />
            </Field>
          </div>
          <Field error={form.formState.errors.correctAnswer} label="正解キー">
            <select className="select" {...form.register("correctAnswer")}>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
            </select>
          </Field>
          <Field error={form.formState.errors.explanation} label="解説">
            <TextArea registration={form.register("explanation")} />
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
            keywordPlaceholder="クイズID / タイトル / 動画ID"
            onKeywordChange={setKeyword}
          />
          {filteredItems.map((item) => (
            <article className="panel stack" key={item.id}>
              <div className="split">
                <strong>{item.data.title}</strong>
                <div className="split">
                  <button
                    className="button secondary"
                    onClick={async () => {
                      const questionId = `question-${item.id}`;
                      const question = await getQuizQuestion(questionId);
                      form.reset({
                        quizId: item.id,
                        questionId,
                        videoId: item.data.videoId,
                        title: item.data.title,
                        description: item.data.description,
                        passingScore: item.data.passingScore,
                        questionText: question?.questionText ?? "",
                        questionType: question?.questionType ?? "multiple_choice",
                        optionA: question?.options[0]?.text ?? "",
                        optionB: question?.options[1]?.text ?? "",
                        optionC: question?.options[2]?.text ?? "",
                        optionD: question?.options[3]?.text ?? "",
                        correctAnswer: question?.correctAnswer ?? "A",
                        explanation: question?.explanation ?? ""
                      });
                    }}
                    type="button"
                  >
                    編集
                  </button>
                  <button className="button danger" onClick={() => deleteQuiz(item.id).then(reload)} type="button">
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
