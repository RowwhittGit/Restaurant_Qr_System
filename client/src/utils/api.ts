import axios, { AxiosError, AxiosResponse } from "axios";
import { error } from "console";

export const apiClient = axios.create({
  baseURL: "http://localhost:3000/api", // Replace with your API base URL
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiClientWithCredentials = axios.create({
  baseURL: "http://localhost:3000/api", // Replace with your API base URL
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Include cookies in requests
});

apiClient.interceptors.response.use(
  (config) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiClientWithCredentials.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - redirect to login
      window.location.href = '/login';
      // Or use your auth store to clear auth state
      // useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
