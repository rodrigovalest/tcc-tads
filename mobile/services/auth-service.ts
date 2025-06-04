import api from '@/api';
import ILoginRequest from "@/models/requests/login-request";
import ILoginResponse from "@/models/responses/login-response";
import IRegisterRequest from "@/models/requests/register-request";

const authService = {
  login: async (data: ILoginRequest): Promise<ILoginResponse> => {
    const response = await api.post<ILoginResponse>('/login', data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    return Promise.resolve();
  },

  loginWithGoogle: async (): Promise<ILoginResponse> => {
    return Promise.reject(new Error("Google login not implemented"));
  },
  async register(data: IRegisterRequest): Promise<void> {
    return api.post("/user", data);
  },
};

export default authService;
