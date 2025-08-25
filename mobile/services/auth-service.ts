import api from "../api";
import ILoginRequest from "../models/requests/login-request";
import ILoginResponse from "../models/responses/login-response";
import { RegisterRequest } from "../models/types/register.types";
import { FormDataBuilder, FileUploadService } from "../utils";

class AuthService {
  constructor(
    private fileUploadService = new FileUploadService(),
    private formDataBuilder = new FormDataBuilder()
  ) {}

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
}

class RegistrationService {
  constructor(
    private fileUploadService = new FileUploadService(),
    private formDataBuilder = new FormDataBuilder()
  ) {}

  async register(data: RegisterRequest): Promise<any> {
    if (data.photo) {
      return this.registerWithPhoto(data);
    }
    return this.registerWithoutPhoto(data);
  }

  private async registerWithPhoto(data: RegisterRequest): Promise<any> {
    const filename = data.photo!.split('/').pop() || 'photo.jpg';
    const ext = filename.split('.').pop()?.toLowerCase();
    const mime = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
    const photoFile = { uri: data.photo!, name: filename, type: mime };
    const builder = this.formDataBuilder.reset();
    builder.append('photo', photoFile as any);
    builder.append('username', data.username);
    builder.append('email', data.email);
    builder.append('nationality', data.nationality);
    builder.append('password', data.password);
    builder.appendArray('languages', data.languages);
    
    if (data.interestTopics && data.interestTopics.length > 0) {
      builder.appendArray('interestTopics', data.interestTopics);
    }
    
    if (data.personalDescription) {
      builder.append('personalDescription', data.personalDescription);
    }

    const formData = builder.build();
    const response = await api.post("/user", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  private async registerWithoutPhoto(data: RegisterRequest): Promise<any> {
    const response = await api.post("/user", data);
    return response.data;
  }
}

export class AuthServiceFactory {
  static createAuthService(): AuthService {
    return new AuthService();
  }

  static createRegistrationService(): RegistrationService {
    return new RegistrationService();
  }
}

const authServiceInstance = AuthServiceFactory.createAuthService();
const registrationServiceInstance = AuthServiceFactory.createRegistrationService();

const authService = {
  login: authServiceInstance.login.bind(authServiceInstance),
  logout: authServiceInstance.logout.bind(authServiceInstance),
  loginWithGoogle: authServiceInstance.loginWithGoogle.bind(authServiceInstance),
  register: registrationServiceInstance.register.bind(registrationServiceInstance),
};

export default authService;
