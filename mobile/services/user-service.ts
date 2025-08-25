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
  constructor(private formDataBuilder = new FormDataBuilder()) {}

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
    const builder = this.formDataBuilder.reset();
    
    if (data.username) builder.append('username', data.username);
    if (data.nationality) builder.append('nationality', data.nationality);
    if (data.personalDescription) builder.append('personalDescription', data.personalDescription);
    if (data.languages) builder.appendArray('languages', data.languages);
    if (data.interestTopics) builder.appendArray('interestTopics', data.interestTopics);
    if (data.removePhoto !== undefined) builder.appendBoolean('removePhoto', data.removePhoto);
    if (data.photoFile) builder.append('photo', data.photoFile as any);
    
    return builder.build();
  }
}

export class UserServiceFactory {
  static create(): UserService {
    return new UserService();
  }
}

const userService = UserServiceFactory.create();
export default userService;
