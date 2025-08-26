import api from "../api";
import ILoginRequest from "../models/requests/login-request";
import ILoginResponse from "../models/responses/login-response";
import { RegisterRequest } from "../models/types/register.types";
import { FormDataBuilder, FileUploadService } from "../utils";

class AuthService {
  async login(data: ILoginRequest): Promise<ILoginResponse> {
    const response = await api.post<ILoginResponse>("/login", data);
    return response.data;
  }

  async logout(): Promise<void> {
    return Promise.resolve();
  }

  async loginWithGoogle(): Promise<ILoginResponse> {
    return Promise.reject(new Error("Google login not implemented"));
  }

  async register(data: RegisterRequest): Promise<any> {
    if (data.photo) {
      return this.registerWithPhoto(data);
    }
    return this.registerWithoutPhoto(data);
  }

  private async registerWithPhoto(data: RegisterRequest): Promise<any> {
    const photoFile = FileUploadService.createPhotoFile(data.photo!);
    const formData = this.buildRegistrationFormData(data, photoFile);
    
    const response = await api.post("/user", formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  }

  private async registerWithoutPhoto(data: RegisterRequest): Promise<any> {
    const response = await api.post("/user", data);
    return response.data;
  }

  private buildRegistrationFormData(data: RegisterRequest, photoFile: any): FormData {
    const builder = new FormDataBuilder();
    const { username, email, nationality, password, languages, interestTopics, personalDescription } = data;
    builder.append('photo', photoFile);
    [
      { key: 'username', value: username },
      { key: 'email', value: email },
      { key: 'nationality', value: nationality },
      { key: 'password', value: password }
    ].forEach(({ key, value }) => {
      builder.append(key, value);
    });
    builder.appendArray('languages', languages);
    if (interestTopics && interestTopics.length > 0) {
      builder.appendArray('interestTopics', interestTopics);
    }  
    if (personalDescription) {
      builder.append('personalDescription', personalDescription);
    }

    return builder.build();
  }
}

const authService = new AuthService();
export default authService;
