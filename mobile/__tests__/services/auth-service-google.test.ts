import authService from "../../services/auth-service";
import api from "../../api";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { configureGoogleSignin } from "../../config/google-signin-config";

jest.mock("../../api");
jest.mock("../../config/google-signin-config");

const mockApi = api as jest.Mocked<typeof api>;
const mockConfigureGoogleSignin = configureGoogleSignin as jest.MockedFunction<
  typeof configureGoogleSignin
>;

describe("AuthService - Google Auth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("loginWithGoogle", () => {
    const mockUserInfo = {
      data: {
        idToken: "mock-id-token",
        user: {
          id: "google-user-id",
          email: "test@gmail.com",
          name: "Test User",
          photo: "https://example.com/photo.jpg",
        },
      },
    };

    it("should successfully login with Google for existing user", async () => {
      const mockResponse = {
        data: {
          access_token: "mock-jwt-token",
          token_type: "Bearer",
          isNewUser: false,
        },
      };

      (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
      (GoogleSignin.signOut as jest.Mock).mockResolvedValue(undefined);
      (GoogleSignin.signIn as jest.Mock).mockResolvedValue(mockUserInfo);
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await authService.loginWithGoogle();

      expect(mockConfigureGoogleSignin).toHaveBeenCalled();
      expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
      expect(GoogleSignin.signOut).toHaveBeenCalled();
      expect(GoogleSignin.signIn).toHaveBeenCalled();
      expect(mockApi.post).toHaveBeenCalledWith("/auth/google/login", {
        idToken: "mock-id-token",
        email: "test@gmail.com",
        name: "Test User",
        photo: "https://example.com/photo.jpg",
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should successfully login with Google for new user requiring registration", async () => {
      const mockResponse = {
        data: {
          access_token: "",
          token_type: "Bearer",
          isNewUser: true,
          requiresRegistration: true,
        },
      };

      (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
      (GoogleSignin.signOut as jest.Mock).mockResolvedValue(undefined);
      (GoogleSignin.signIn as jest.Mock).mockResolvedValue(mockUserInfo);
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await authService.loginWithGoogle();

      expect(result).toEqual(mockResponse.data);
      expect(result.requiresRegistration).toBe(true);
      expect(result.isNewUser).toBe(true);
    });

    it("should handle Google sign-in without photo", async () => {
      const mockUserInfoWithoutPhoto = {
        data: {
          idToken: "mock-id-token",
          user: {
            id: "google-user-id",
            email: "test@gmail.com",
            name: "Test User",
            photo: null,
          },
        },
      };

      const mockResponse = {
        data: {
          access_token: "mock-jwt-token",
          token_type: "Bearer",
          isNewUser: false,
        },
      };

      (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
      (GoogleSignin.signOut as jest.Mock).mockResolvedValue(undefined);
      (GoogleSignin.signIn as jest.Mock).mockResolvedValue(
        mockUserInfoWithoutPhoto
      );
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await authService.loginWithGoogle();

      expect(mockApi.post).toHaveBeenCalledWith("/auth/google/login", {
        idToken: "mock-id-token",
        email: "test@gmail.com",
        name: "Test User",
        photo: undefined,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should throw error when Play Services is not available", async () => {
      const error = new Error("Google Play Services not available");
      (error as any).code = 2; // statusCodes.PLAY_SERVICES_NOT_AVAILABLE
      (GoogleSignin.hasPlayServices as jest.Mock).mockRejectedValue(error);

      await expect(authService.loginWithGoogle()).rejects.toThrow(
        "Google Play Services not available"
      );

      expect(mockConfigureGoogleSignin).toHaveBeenCalled();
      expect(GoogleSignin.hasPlayServices).toHaveBeenCalled();
      expect(GoogleSignin.signIn).not.toHaveBeenCalled();
      expect(mockApi.post).not.toHaveBeenCalled();
    });

    it("should throw error when Google Sign-In is cancelled", async () => {
      const error = new Error("Sign-in cancelled");
      (error as any).code = -5; // statusCodes.SIGN_IN_CANCELLED
      (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
      (GoogleSignin.signOut as jest.Mock).mockResolvedValue(undefined);
      (GoogleSignin.signIn as jest.Mock).mockRejectedValue(error);

      await expect(authService.loginWithGoogle()).rejects.toThrow(
        "Google sign-in was cancelled"
      );

      expect(GoogleSignin.signIn).toHaveBeenCalled();
      expect(mockApi.post).not.toHaveBeenCalled();
    });

    it("should throw error when Google Sign-In is in progress", async () => {
      const error = new Error("Sign-in in progress");
      (error as any).code = -1; // statusCodes.IN_PROGRESS
      (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
      (GoogleSignin.signOut as jest.Mock).mockResolvedValue(undefined);
      (GoogleSignin.signIn as jest.Mock).mockRejectedValue(error);

      await expect(authService.loginWithGoogle()).rejects.toThrow(
        "Google sign-in is already in progress"
      );

      expect(GoogleSignin.signIn).toHaveBeenCalled();
      expect(mockApi.post).not.toHaveBeenCalled();
    });

    it("should handle developer error", async () => {
      const error = new Error("DEVELOPER_ERROR: Something went wrong");
      (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
      (GoogleSignin.signOut as jest.Mock).mockResolvedValue(undefined);
      (GoogleSignin.signIn as jest.Mock).mockRejectedValue(error);

      await expect(authService.loginWithGoogle()).rejects.toThrow(
        "Google Sign-in configuration error. Please check your setup."
      );

      expect(GoogleSignin.signIn).toHaveBeenCalled();
      expect(mockApi.post).not.toHaveBeenCalled();
    });

    it("should handle backend API error", async () => {
      (GoogleSignin.hasPlayServices as jest.Mock).mockResolvedValue(true);
      (GoogleSignin.signOut as jest.Mock).mockResolvedValue(undefined);
      (GoogleSignin.signIn as jest.Mock).mockResolvedValue(mockUserInfo);
      mockApi.post.mockRejectedValue(new Error("Backend error"));

      await expect(authService.loginWithGoogle()).rejects.toThrow(
        "Backend error"
      );

      expect(mockApi.post).toHaveBeenCalledWith("/auth/google/login", {
        idToken: "mock-id-token",
        email: "test@gmail.com",
        name: "Test User",
        photo: "https://example.com/photo.jpg",
      });
    });
  });

  describe("linkGoogleAccount", () => {
    it("should successfully link Google account", async () => {
      const mockIdToken = "mock-id-token";
      const mockResponse = {
        data: {
          success: true,
          message: "Google account linked successfully",
        },
      };

      mockApi.post.mockResolvedValue(mockResponse);

      const result = await authService.linkGoogleAccount(mockIdToken);

      expect(mockApi.post).toHaveBeenCalledWith("/auth/google/link", {
        idToken: mockIdToken,
      });
      expect(result).toEqual(mockResponse.data);
    });

    it("should handle error when linking Google account", async () => {
      const mockIdToken = "mock-id-token";
      const error = new Error("Account already linked");
      mockApi.post.mockRejectedValue(error);

      await expect(authService.linkGoogleAccount(mockIdToken)).rejects.toThrow(
        "Account already linked"
      );

      expect(mockApi.post).toHaveBeenCalledWith("/auth/google/link", {
        idToken: mockIdToken,
      });
    });
  });

  describe("unlinkGoogleAccount", () => {
    it("should successfully unlink Google account", async () => {
      mockApi.delete.mockResolvedValue({ data: undefined });

      await authService.unlinkGoogleAccount();

      expect(mockApi.delete).toHaveBeenCalledWith("/auth/google/unlink");
    });

    it("should handle error when unlinking Google account", async () => {
      const error = new Error("No Google account linked");
      mockApi.delete.mockRejectedValue(error);

      await expect(authService.unlinkGoogleAccount()).rejects.toThrow(
        "No Google account linked"
      );

      expect(mockApi.delete).toHaveBeenCalledWith("/auth/google/unlink");
    });
  });

  describe("getGoogleUserInfo", () => {
    it("should return current Google user info", async () => {
      const mockCurrentUser = {
        user: {
          id: "google-user-id",
          name: "Test User",
          email: "test@gmail.com",
          photo: "https://example.com/photo.jpg",
          familyName: "User",
          givenName: "Test",
        },
      };

      (GoogleSignin.getCurrentUser as jest.Mock).mockResolvedValue(
        mockCurrentUser
      );

      const result = await authService.getGoogleUserInfo();

      expect(mockConfigureGoogleSignin).toHaveBeenCalled();
      expect(GoogleSignin.getCurrentUser).toHaveBeenCalled();
      expect(result).toEqual(mockCurrentUser.user);
    });

    it("should return null when no current user", async () => {
      (GoogleSignin.getCurrentUser as jest.Mock).mockResolvedValue(null);

      const result = await authService.getGoogleUserInfo();

      expect(GoogleSignin.getCurrentUser).toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it("should return null when user object is missing", async () => {
      (GoogleSignin.getCurrentUser as jest.Mock).mockResolvedValue({});

      const result = await authService.getGoogleUserInfo();

      expect(result).toBeNull();
    });

    it("should handle errors and return null", async () => {
      (GoogleSignin.getCurrentUser as jest.Mock).mockRejectedValue(
        new Error("Failed to get current user")
      );

      const result = await authService.getGoogleUserInfo();

      expect(result).toBeNull();
    });
  });
});
