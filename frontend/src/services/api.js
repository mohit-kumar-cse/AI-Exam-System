import axios from "axios";

const configuredUrl =
  import.meta.env.VITE_API_URL ||
  "https://ai-exam-system-glfn.onrender.com";

const apiBaseUrl = configuredUrl
  .trim()
  .replace(/\/+$/, "")
  .replace(/\/api$/i, "");

const api = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  try {
    const auth = localStorage.getItem("auth");

    if (auth) {
      const { token } = JSON.parse(auth);

      if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  } catch (error) {
    console.warn("Invalid stored auth data:", error);
    localStorage.removeItem("auth");
    localStorage.removeItem("token");
  }

  return config;
});

export default api;
