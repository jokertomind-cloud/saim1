import type { FieldError, UseFormRegisterReturn } from "react-hook-form";

export const Field = ({
  label,
  error,
  children
}: {
  label: string;
  error?: FieldError;
  children: React.ReactNode;
}) => (
  <label className="field">
    <span>{label}</span>
    {children}
    {error ? <small className="error-text">{error.message}</small> : null}
  </label>
);

export const TextInput = ({
  registration,
  type = "text",
  placeholder
}: {
  registration: UseFormRegisterReturn;
  type?: string;
  placeholder?: string;
}) => <input className="input" type={type} placeholder={placeholder} {...registration} />;

export const TextArea = ({
  registration,
  rows = 3
}: {
  registration: UseFormRegisterReturn;
  rows?: number;
}) => <textarea className="textarea" rows={rows} {...registration} />;
