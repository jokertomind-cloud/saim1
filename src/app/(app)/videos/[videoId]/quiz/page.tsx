"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { QuizForm } from "@/components/quiz/quiz-form";
import { ErrorState, LoadingState, SuccessState } from "@/components/ui/feedback";
import { getUnlockedQuizBundle, submitQuizAnswers } from "@/lib/services/quiz-service";
import { useAuth } from "@/providers/auth-provider";
import type { Quiz, QuizQuestion, UserProgress, WithId } from "@/types/models";

export default function QuizPage() {
  const params = useParams<{ videoId: string }>();
  const { user, profile } = useAuth();
  const videoId = params.videoId ?? "";
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [quiz, setQuiz] = useState<WithId<Quiz> | null>(null);
  const [questions, setQuestions] = useState<WithId<QuizQuestion>[]>([]);
  const [resultText, setResultText] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !videoId) return;
    setLoading(true);
    setError("");
    getUnlockedQuizBundle(user.uid, videoId)
      .then(({ progress: nextProgress, quiz: nextQuiz, questions: nextQuestions }) => {
        setProgress(nextProgress);
        setQuiz(nextQuiz);
        setQuestions(nextQuestions);
      })
      .catch(() => setError("クイズ情報の取得に失敗しました。"))
      .finally(() => setLoading(false));
  }, [user, videoId]);

  const submit = async (answers: Record<string, string>) => {
    if (!quiz || !user || !progress) return;
    setError("");
    setResultText("");
    try {
      const result = await submitQuizAnswers({
        uid: user.uid,
        submission: {
          quizId: quiz.id,
          videoId,
          answers
        },
        questions,
        passingScore: quiz.data.passingScore,
        progress,
        userGender: profile?.gender ?? "other"
      });
      setProgress(result.progress);
      setResultText(result.passed ? "合格です。次の教材が解放されました。" : "今回は不合格です。もう一度挑戦できます。");
    } catch {
      setError("回答結果の保存に失敗しました。");
    }
  };

  if (loading) return <LoadingState label="クイズを読み込み中..." />;
  if (error) return <ErrorState message={error} />;

  if (progress && !progress.unlockedVideoIds.includes(videoId) && !progress.completedVideoIds.includes(videoId)) {
    return <section className="card">未解放の動画に紐づくクイズです。</section>;
  }

  return (
    <div className="stack">
      <section className="card stack">
        <h2>{quiz?.data.title ?? "クイズ"}</h2>
        <p>{quiz?.data.description}</p>
      </section>
      {quiz ? <QuizForm onSubmit={submit} questions={questions} /> : null}
      {resultText ? <SuccessState message={resultText} /> : null}
    </div>
  );
}
