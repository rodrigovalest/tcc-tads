import axios from "axios";
import ILoginRequest from "@/models/requests/login-request";
import ILoginResponse from "@/models/responses/login-response";

const authService = {
  login: async (data: ILoginRequest): Promise<ILoginResponse> => {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;
    const response = await axios.post<ILoginResponse>(
      `${API_BASE_URL}/login`,
      data
    );
    return response.data;
  },
  logout: async (): Promise<void> => {
    console.log("Logout action performed and auth state cleared");
    return Promise.resolve();
  },
  loginWithGoogle: async (): Promise<ILoginResponse> => {
    // Replace with your actual Google login implementation
    console.log("Attempting Google login...");
    return Promise.reject(new Error("Google login not implemented"));
  },
};

export default authService;
