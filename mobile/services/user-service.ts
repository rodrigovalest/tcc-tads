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
};

export default userService;
