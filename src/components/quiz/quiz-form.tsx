"use client";

import { useState } from "react";
import type { QuizQuestion, WithId } from "@/types/models";

export const QuizForm = ({
  questions,
  onSubmit
}: {
  questions: WithId<QuizQuestion>[];
  onSubmit: (answers: Record<string, string>) => void;
}) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});

  return (
    <div className="stack">
      {questions.map((question, index) => (
        <section className="card stack" key={question.id}>
          <h3>
            Q{index + 1}. {question.data.questionText}
          </h3>
          <div className="stack">
            {question.data.options.map((option) => (
              <label className="option" key={option.key}>
                <input
                  checked={answers[question.id] === option.key}
                  name={question.id}
                  onChange={() =>
                    setAnswers((current) => ({
                      ...current,
                      [question.id]: option.key
                    }))
                  }
                  type="radio"
                />
                <span>{option.text}</span>
              </label>
            ))}
          </div>
        </section>
      ))}
      <button className="button" onClick={() => onSubmit(answers)} type="button">
        回答を送信
      </button>
    </div>
  );
};
