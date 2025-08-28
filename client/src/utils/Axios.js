import axios from "axios";
import { baseURL } from "../common/summaryApi";

export const Axios = axios.create({
  baseURL: baseURL,
  withCredentials: true
});

// Attach access token to each request
Axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accesstoken");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);
