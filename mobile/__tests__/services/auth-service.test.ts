import authService from "@/services/auth-service";
import api from "@/api";
import ILoginRequest from "@/models/requests/login-request";
import ILoginResponse from "@/models/responses/login-response";

jest.mock("@/api");

const mockedApi = api as jest.Mocked<typeof api>;

describe("authService.login", () => {
  it("send correct data and returns token", async () => {
    // Arrange
    const mockRequest: ILoginRequest = {
      email: "user@example.com",
      password: "123456",
    };

    const mockResponse: ILoginResponse = {
      access_token: "fake-token",
      token_type: "bearer",
    };

    mockedApi.post.mockResolvedValueOnce({ data: mockResponse });

    // Act
    const result = await authService.login(mockRequest);

    // Assert
    expect(mockedApi.post).toHaveBeenCalledWith("/login", mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it("throws error when API request fails", async () => {
    // Arrange
    const mockRequest: ILoginRequest = {
      email: "user@example.com",
      password: "wrong-password",
    };

    const mockError = new Error("Network Error");

    mockedApi.post.mockRejectedValueOnce(mockError);

    // Act & Assert
    await expect(authService.login(mockRequest)).rejects.toThrow(
      "Network Error"
    );
  });
});
