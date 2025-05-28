import axios from "axios";
import userService from "../../services/user-service";
import IUsuarioResponse from "../../models/responses/user-response";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

const MOCK_API_URL = "http://mockapi.com/api";
process.env.EXPO_PUBLIC_API_URL = MOCK_API_URL;

describe("userService", () => {
  beforeEach(() => {
    mockedAxios.get.mockClear();
  });

  describe("getProfile", () => {
    const mockToken = "fake_bearer_token";
    const mockUserProfile: IUsuarioResponse = {
      id: 1,
      username: "testuser",
      email: "test@example.com",
      isActive: true,
      lastLoginAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    it("should call axios.get with correct URL and headers, and return user profile on success", async () => {
      mockedAxios.get.mockResolvedValueOnce({ data: mockUserProfile });

      const result = await userService.getProfile(mockToken);

      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${MOCK_API_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });
      expect(result).toEqual(mockUserProfile);
    });

    it("should throw an error if no token is provided", async () => {
      await expect(userService.getProfile("")).rejects.toThrow(
        "No token found"
      );
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it("should throw an error if axios.get throws an error", async () => {
      const errorMessage = "Network Error";
      mockedAxios.get.mockRejectedValueOnce(new Error(errorMessage));

      await expect(userService.getProfile(mockToken)).rejects.toThrow(
        errorMessage
      );
      expect(mockedAxios.get).toHaveBeenCalledTimes(1);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${MOCK_API_URL}/user/me`, {
        headers: {
          Authorization: `Bearer ${mockToken}`,
        },
      });
    });
  });
});
