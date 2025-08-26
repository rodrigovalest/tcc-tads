import api from "../api";
import IUserResponse from "../models/responses/user-response";
import { FormDataBuilder } from "../utils";

interface UserUpdateData {
  username?: string;
  nationality?: string;
  personalDescription?: string;
  languages?: { languageCode: string; fluencyLevel: number }[];
  interestTopics?: string[];
  removePhoto?: boolean;
  photoFile?: { uri: string; name: string; type: string } | null;
}

class UserService {
  async findAll(): Promise<IUserResponse[]> {
    const response = await api.get<IUserResponse[]>("/user");
    return response.data;
  }

  async findById(id: number): Promise<IUserResponse> {
    const response = await api.get<IUserResponse>(`/user/${id}`);
    return response.data;
  }

  async update(id: number, data: UserUpdateData): Promise<IUserResponse> {
    const formData = this.buildUpdateFormData(data);
    
    const response = await api.patch<IUserResponse>(`/user/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  private buildUpdateFormData(data: UserUpdateData): FormData {
    const builder = new FormDataBuilder();
    const { username, nationality, personalDescription, languages, interestTopics, removePhoto, photoFile } = data;
    [
      { key: 'username', value: username },
      { key: 'nationality', value: nationality },
      { key: 'personalDescription', value: personalDescription }
    ].forEach(({ key, value }) => {
      if (value) builder.append(key, value);
    });
    [
      { key: 'languages', value: languages },
      { key: 'interestTopics', value: interestTopics }
    ].forEach(({ key, value }) => {
      if (value) builder.appendArray(key, value);
    });
    if (removePhoto !== undefined) {
      builder.appendBoolean('removePhoto', removePhoto);
    }
    if (photoFile) {
      builder.append('photo', photoFile as any);
    }
    return builder.build();
  }
}

const userService = new UserService();
export default userService;
