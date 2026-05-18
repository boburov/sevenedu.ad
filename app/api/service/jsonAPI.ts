import axios from "axios";

const jsonApi = axios.create({
  baseURL: "https://api.sevenedu.org",
  headers: {
    "Content-Type": "application/json",
  },
});

jsonApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default jsonApi;
