import api from "../api";
import ILoginRequest from "../models/requests/login-request";
import ILoginResponse from "../models/responses/login-response";
import { RegisterRequest } from "../models/types/register.types";
import {
  GoogleLoginRequest,
  GoogleLoginResponse,
  GoogleLinkRequest,
  GoogleLinkResponse,
} from "../models/types/google-auth.types";
import { FormDataBuilder, FileUploadService } from "../utils";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { configureGoogleSignin } from "../config/google-signin-config";

class AuthService {
  async login(data: ILoginRequest): Promise<ILoginResponse> {
    const response = await api.post<ILoginResponse>("/login", data);
    return response.data;
  }

  async logout(): Promise<void> {
    return Promise.resolve();
  }

  async loginWithGoogle(): Promise<GoogleLoginResponse> {
    try {
      configureGoogleSignin();
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();

      const userInfo = await GoogleSignin.signIn();

      if (!userInfo) {
        throw new Error("Failed to get user information from Google");
      }

      const idToken = userInfo.data?.idToken;
      if (!idToken) {
        throw new Error("Failed to get Google ID token");
      }

      const user = userInfo.data?.user;
      if (!user) {
        throw new Error("Failed to get user data from Google");
      }

      const googleData: GoogleLoginRequest = {
        idToken,
        email: user.email,
        name: user.name || user.email,
        photo: user.photo || undefined,
      };

      const response = await api.post<GoogleLoginResponse>(
        "/auth/google/login",
        googleData
      );
      return response.data;
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new Error("Google sign-in was cancelled");
      } else if (error.code === statusCodes.IN_PROGRESS) {
        throw new Error("Google sign-in is already in progress");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new Error("Google Play Services not available");
      } else if (error.code === statusCodes.SIGN_IN_REQUIRED) {
        throw new Error("User needs to sign in");
      } else if (error.message?.includes("DEVELOPER_ERROR")) {
        throw new Error(
          "Google Sign-in configuration error. Please check your setup."
        );
      } else if (error.message?.includes("non-recoverable sign in failure")) {
        throw new Error(
          "Google Sign-in configuration error. Please verify your Client IDs and SHA-1 fingerprints."
        );
      }

      throw error;
    }
  }

  async linkGoogleAccount(idToken: string): Promise<GoogleLinkResponse> {
    const linkData: GoogleLinkRequest = { idToken };
    const response = await api.post<GoogleLinkResponse>(
      "/auth/google/link",
      linkData
    );
    return response.data;
  }

  async unlinkGoogleAccount(): Promise<void> {
    await api.delete("/auth/google/unlink");
  }

  async getGoogleUserInfo() {
    try {
      configureGoogleSignin();
      const userInfo = await GoogleSignin.getCurrentUser();
      return userInfo?.user || null;
    } catch (error) {
      console.error("Error getting Google user info:", error);
      return null;
    }
  }

  async getGoogleLinkStatus(): Promise<{ linked: boolean; email?: string }> {
    const response = await api.get("/auth/google/status");
    return response.data;
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
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  private async registerWithoutPhoto(data: RegisterRequest): Promise<any> {
    const response = await api.post("/user", data);
    return response.data;
  }

  private buildRegistrationFormData(
    data: RegisterRequest,
    photoFile: any
  ): FormData {
    const builder = new FormDataBuilder();
    const {
      name,
      username,
      email,
      nationality,
      password,
      languages,
      interestTopics,
      personalDescription,
    } = data;
    builder.append("photo", photoFile);
    [
      { key: "name", value: name },
      { key: "username", value: username },
      { key: "email", value: email },
      { key: "nationality", value: nationality },
      { key: "password", value: password },
    ].forEach(({ key, value }) => {
      builder.append(key, value);
    });
    builder.appendArray("languages", languages);
    if (interestTopics && interestTopics.length > 0) {
      builder.appendArray("interestTopics", interestTopics);
    }
    if (personalDescription) {
      builder.append("personalDescription", personalDescription);
    }

    return builder.build();
  }
}

const authService = new AuthService();
export default authService;
