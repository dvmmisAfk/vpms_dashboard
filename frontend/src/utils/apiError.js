// utils/apiError.js
export function apiErrorMessage(error, fallback = "Something went wrong") {
  const data = error?.response?.data;
  if (typeof data?.message === "string" && data.message) return data.message;
  const list = data?.errors;
  const first = Array.isArray(list) ? list[0] : null;
  if (first && typeof first.msg === "string") return first.msg;
  if (typeof first === "string") return first;
  if (error?.code === "ERR_NETWORK") {
    return "Cannot reach the API. Start the backend and check VITE_API_URL (e.g. http://localhost:5000/api).";
  }
  if (!error?.response && typeof error?.message === "string" && error.message) {
    return error.message;
  }
  return fallback;
}
