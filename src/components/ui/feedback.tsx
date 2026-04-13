export const LoadingState = ({ label = "読み込み中..." }: { label?: string }) => (
  <div className="feedback loading" aria-live="polite">
    <span className="spinner" aria-hidden="true" />
    <span>{label}</span>
  </div>
);

export const ErrorState = ({
  title = "エラーが発生しました",
  message
}: {
  title?: string;
  message: string;
}) => (
  <div className="feedback error" role="alert">
    <strong>{title}</strong>
    <span>{message}</span>
  </div>
);

export const SuccessState = ({ message }: { message: string }) => (
  <div className="feedback success" aria-live="polite">
    <strong>完了</strong>
    <span>{message}</span>
  </div>
);
