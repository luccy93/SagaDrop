import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL || "";
export const API = BASE ? `${BASE}/api` : "/api";

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
export const fetchBook = (id) => http.get(`/books/${id}`).then((r) => r.data);
export const fetchBooks = (params) => http.get("/books", { params }).then((r) => r.data);
export const searchBooks = (q) => http.get("/books", { params: { q } }).then((r) => r.data);
export const createBook = (data) => http.post("/books", data).then((r) => r.data);
export const updateBook = (id, data) => http.put(`/books/${id}`, data).then((r) => r.data);
export const deleteBook = (id) => http.delete(`/books/${id}`).then((r) => r.data);
export const fetchCategories = () => http.get("/categories").then((r) => r.data);
export const subscribeNewsletter = (email) =>
  http.post("/newsletter", { email }).then((r) => r.data);
export const aiRecommend = (mood, tone) =>
  http.post("/ai/recommend", { mood, tone }).then((r) => r.data);
export const aiGenerateCover = (payload) =>
  http.post("/ai/generate-cover", payload, { timeout: 120000 }).then((r) => r.data);
export const createShare = (payload) => http.post("/share", payload).then((r) => r.data);
export const fetchShare = (id) => http.get(`/share/${id}`).then((r) => r.data);

export const fetchPublicConfig = () => http.get("/public-config").then((r) => r.data);

export const authMe = () => http.get("/auth/me").then((r) => r.data);
export const authLogin = (email, password) =>
  http.post("/auth/login", { email, password }).then((r) => r.data);
export const authRegister = (name, email, password) =>
  http.post("/auth/register", { name, email, password }).then((r) => r.data);
export const authLogout = () => http.post("/auth/logout").then((r) => r.data);
export const fetchAccountState = () => http.get("/auth/state").then((r) => r.data);
export const saveAccountState = (state) => http.put("/auth/state", state).then((r) => r.data);

// OTP
export const authSendOtp = (payload) =>
  http.post("/auth/send-otp", payload).then((r) => r.data);
export const authVerifyOtp = (payload) =>
  http.post("/auth/verify-otp", payload).then((r) => r.data);

// Google OAuth
export const authGoogle = (access_token) =>
  http.post("/auth/google", { access_token }).then((r) => r.data);

// Profile & password
export const updateProfile = (data) => http.put("/auth/profile", data).then((r) => r.data);
export const changePassword = (data) => http.post("/auth/change-password", data).then((r) => r.data);
export const resetPassword = (data) => http.post("/auth/reset-password", data).then((r) => r.data);

// Orders
export const fetchMyOrders = () => http.get("/checkout/my-orders").then((r) => r.data);

// Coupons
export const validateCoupon = (code, cart_total) => http.post("/coupons/validate", { code, cart_total }).then((r) => r.data);
export const claimCoupon = (code, cart_total) => http.post("/coupons/claim", { code, cart_total }).then((r) => r.data);
export const fetchCoupons = () => http.get("/coupons/admin").then((r) => r.data);
export const createCoupon = (data) => http.post("/coupons/admin", data).then((r) => r.data);
export const deleteCoupon = (code) => http.delete(`/coupons/admin/${code}`).then((r) => r.data);

// Reviews
export const createReview = (data) => http.post("/reviews", data).then((r) => r.data);
export const fetchReviews = (bookId) => http.get(`/reviews/${bookId}`).then((r) => r.data);
export const fetchReviewStats = (bookId) => http.get(`/reviews/${bookId}/stats`).then((r) => r.data);

// Admin - customers
export const fetchCustomers = () => http.get("/auth/users").then((r) => r.data);

// File upload
export const uploadCover = (file) => {
  const form = new FormData();
  form.append("file", file);
  return axios.post(`${BASE}/api/storage/upload`, form, {
    headers: { "Content-Type": "multipart/form-data" },
    withCredentials: true,
  }).then((r) => r.data);
};
