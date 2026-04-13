export const parseCsvIds = (value: string) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
