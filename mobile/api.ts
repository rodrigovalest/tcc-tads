import axios, { AxiosError } from 'axios';

export type ApiError = {
  status: number;
  message: string;
};

const api = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.100.122:3000',
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status ?? 500;
    const message =
      (error.response?.data as any)?.message ||
      error.message ||
      'Something went wrong';

    console.error('[API Error]', error.toJSON());

    return Promise.reject({ status, message });
  }
);

export default api;
