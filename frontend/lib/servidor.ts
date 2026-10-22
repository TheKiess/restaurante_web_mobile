export const URL_API = (
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
).replace(/\/+$/, "");
