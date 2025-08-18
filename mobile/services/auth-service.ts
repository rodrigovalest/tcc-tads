import api from "../api";
import ILoginRequest from "../models/requests/login-request";
import ILoginResponse from "../models/responses/login-response";
import { RegisterRequest } from "../types/register.types";

const authService = {
  login: async (data: ILoginRequest): Promise<ILoginResponse> => {
    const response = await api.post<ILoginResponse>("/login", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    return Promise.resolve();
  },

  loginWithGoogle: async (): Promise<ILoginResponse> => {
    return Promise.reject(new Error("Google login not implemented"));
  },

  register: async (data: RegisterRequest): Promise<any> => {
    if (data.photo) {
      const formData = new FormData();
      const response = await fetch(data.photo);
      const blob = await response.blob();

      formData.append('photo', blob as any, 'photo.jpg');
      formData.append('username', data.username);
      formData.append('email', data.email);
      formData.append('nationality', data.nationality);
      formData.append('password', data.password);
      formData.append('languages', JSON.stringify(data.languages));
      
      if (data.interestTopics) {
        formData.append('interestTopics', JSON.stringify(data.interestTopics));
      }
      
      if (data.personalDescription) {
        formData.append('personalDescription', data.personalDescription);
      }

      const response2 = await api.post("/user", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response2.data;
    } else {
      const response = await api.post("/user", data);
      return response.data;
    }
  },
};

export default authService;
