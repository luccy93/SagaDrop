import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL;
export const API = `${BASE}/api`;

export const http = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
  timeout: 60000,
  withCredentials: true,
});

export function formatApiErrorDetail(detail) {
  if (detail == null) return "";
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail))
    return detail.map((e) => (e && typeof e.msg === "string" ? e.msg : JSON.stringify(e))).filter(Boolean).join(" ");
  if (detail && typeof detail.msg === "string") return detail.msg;
  return String(detail);
}

export const fetchTrending = () => http.get("/books/trending").then((r) => r.data);
export const fetchBooks = (params) => http.get("/books", { params }).then((r) => r.data);
export const fetchCategories = () => http.get("/categories").then((r) => r.data);
export const subscribeNewsletter = (email) =>
  http.post("/newsletter", { email }).then((r) => r.data);
export const aiRecommend = (mood, tone) =>
  http.post("/ai/recommend", { mood, tone }).then((r) => r.data);
export const aiGenerateCover = (payload) =>
  http.post("/ai/generate-cover", payload, { timeout: 120000 }).then((r) => r.data);
export const createShare = (payload) => http.post("/share", payload).then((r) => r.data);
export const fetchShare = (id) => http.get(`/share/${id}`).then((r) => r.data);

export const authMe = () => http.get("/auth/me").then((r) => r.data);
export const authLogin = (email, password) =>
  http.post("/auth/login", { email, password }).then((r) => r.data);
export const authRegister = (name, email, password) =>
  http.post("/auth/register", { name, email, password }).then((r) => r.data);
export const authLogout = () => http.post("/auth/logout").then((r) => r.data);
export const fetchAccountState = () => http.get("/auth/state").then((r) => r.data);
export const saveAccountState = (state) => http.put("/auth/state", state).then((r) => r.data);
