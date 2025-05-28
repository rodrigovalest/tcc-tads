import axios from "axios";
import IUsuarioResponse from "@/models/responses/user-response";

const userService = {
  getProfile: async (token: string): Promise<IUsuarioResponse> => {
    const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

    if (!token) {
      throw new Error("No token found");
    }

    const response = await axios.get<IUsuarioResponse>(
      `${API_BASE_URL}/user/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
    return response.data;
  },
};

export default userService;
