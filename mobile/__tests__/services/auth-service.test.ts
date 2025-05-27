import axios from "axios";
import authService from "../../services/auth-service";
import ILoginRequest from "../../models/requests/login-request";
import ILoginResponse from "../../models/responses/login-response";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const MOCK_API_URL = "http://mockapi.com/api";
process.env.EXPO_PUBLIC_API_URL = MOCK_API_URL;

describe("authService", () => {
  beforeEach(() => {
    mockedAxios.post.mockClear();
    mockedAxios.get.mockClear();
  });

  describe("login", () => {
    const loginData: ILoginRequest = {
      email: "test@example.com",
      password: "password123",
    };

    it("should call axios.post with correct URL and data, and return response data on success", async () => {
      const mockLoginResponse: ILoginResponse = {
        access_token: "fake_access_token",
        token_type: "Bearer",
      };
      mockedAxios.post.mockResolvedValueOnce({ data: mockLoginResponse });

      const result = await authService.login(loginData);

      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${MOCK_API_URL}/login`,
        loginData
      );
      expect(result).toEqual(mockLoginResponse);
    });

    it("should throw an error if axios.post throws an error", async () => {
      const errorMessage = "Network Error";
      mockedAxios.post.mockRejectedValueOnce(new Error(errorMessage));

      await expect(authService.login(loginData)).rejects.toThrow(errorMessage);
      expect(mockedAxios.post).toHaveBeenCalledTimes(1);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${MOCK_API_URL}/login`,
        loginData
      );
    });
  });

  describe("logout", () => {
    it("should resolve and log a message (current implementation)", async () => {
      const consoleSpy = jest.spyOn(console, "log");
      await expect(authService.logout()).resolves.toBeUndefined();
      expect(consoleSpy).toHaveBeenCalledWith("Logout action performed");
      consoleSpy.mockRestore();
    });
  });

  describe("loginWithGoogle", () => {
    it("should reject with 'Google login not implemented' error", async () => {
      const consoleSpy = jest.spyOn(console, "log");
      await expect(authService.loginWithGoogle()).rejects.toThrow(
        "Google login not implemented"
      );
      expect(consoleSpy).toHaveBeenCalledWith("Attempting Google login...");
      consoleSpy.mockRestore();
    });
  });
});
