import api from "../api";
import IUserResponse from "../models/responses/user-response";

const userService = {
  findAll: async (): Promise<IUserResponse[]> => {
    const response = await api.get<IUserResponse[]>("/user");
    return response.data;
  },
  findById: async (id: number): Promise<IUserResponse> => {
    const response = await api.get<IUserResponse>(`/user/${id}`);
    return response.data;
  },
  update: async (
    id: number,
    data: {
      username?: string;
      nationality?: string;
      personalDescription?: string;
      languages?: { languageCode: string; fluencyLevel: number }[];
      interestTopics?: string[];
      removePhoto?: boolean;
      photoFile?: { uri: string; name: string; type: string } | null;
    }
  ): Promise<IUserResponse> => {
    const form = new FormData();
    if (typeof data.username === 'string') form.append('username', data.username);
    if (typeof data.nationality === 'string') form.append('nationality', data.nationality);
    if (typeof data.personalDescription === 'string') form.append('personalDescription', data.personalDescription);
    if (Array.isArray(data.languages)) form.append('languages', JSON.stringify(data.languages));
    if (Array.isArray(data.interestTopics)) form.append('interestTopics', JSON.stringify(data.interestTopics));
    if (typeof data.removePhoto === 'boolean') form.append('removePhoto', String(data.removePhoto));
    if (data.photoFile) {
      // @ts-ignore RN FormData file shape
      form.append('photo', data.photoFile);
    }

    const response = await api.patch<IUserResponse>(`/user/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default userService;
