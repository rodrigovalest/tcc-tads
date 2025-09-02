import { act, renderHook, waitFor } from "@testing-library/react-native";
import useMatchmaking from "../../hooks/useMatchmaking";
import webSocketService from "../../services/web-socket-service";
import Toast from "react-native-toast-message";

// mocks

const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: jest.fn(() => ({
    replace: mockReplace,
    push: mockPush,
  })),
}));

jest.mock("react-native-toast-message", () => ({
  show: jest.fn(),
}));

jest.mock("../../services/web-socket-service", () => ({
  connect: jest.fn(),
  disconnect: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
  onDisconnect: jest.fn(),
  isConnected: jest.fn(),
}));

jest.mock("../../store/auth-store", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    token: "mock-token",
  })),
}));

jest.mock("../../store/match-store", () => ({
  __esModule: true,
  default: jest.fn(() => ({
    matchFormat: "format1",
    matchLanguage: "en",
    matchMode: "mode1",
    matchId: "mocked-match-id",
    setMatchId: jest.fn(),
    setIsOfferer: jest.fn(),
    resetMatch: jest.fn(),
    setUserBuddy: jest.fn(),
  })),
}));


describe("useMatchmaking", () => {
  let useAuthStore: jest.Mock;
  let useMatchStore: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    useAuthStore = require("../../store/auth-store").default;
    useMatchStore = require("../../store/match-store").default;
  });

  it("should reset match, disconnect and redirect because of a missing token or params", async () => {
    // Arrange
    useAuthStore.mockReturnValue({ token: null });
    useMatchStore.mockReturnValue({
      matchFormat: null,
      matchLanguage: null,
      matchMode: null,
      resetMatch: jest.fn(),
    });

    // Act
    renderHook(() => useMatchmaking());

    // Assert
    await waitFor(() => {
      expect(useMatchStore().resetMatch).toHaveBeenCalledTimes(1);
      expect(webSocketService.disconnect).toHaveBeenCalledTimes(1);
      expect(mockReplace).toHaveBeenCalledWith("/(private)/(tabs)/matches");
    });
  });

  it("should connect to websocket, setup listeners and emit enqueue event", async () => {
    // Arrange
    useAuthStore.mockReturnValue({ token: "valid-token" });
    useMatchStore.mockReturnValue({
      matchId: "mockerdMatchId1",
      matchFormat: "format1",
      matchLanguage: "en",
      matchMode: "mode1",
      setMatchId: jest.fn(),
      setIsOfferer: jest.fn(),
      resetMatch: jest.fn(),
      setUserBuddy: jest.fn(),
    });
  
    // Act
    renderHook(() => useMatchmaking());

    // Assert
    await waitFor(() => {
      expect(webSocketService.connect).toHaveBeenCalledWith("valid-token");
      expect(webSocketService.connect).toHaveBeenCalledTimes(1);
      expect(webSocketService.onDisconnect).toHaveBeenCalledWith(expect.any(Function));
      expect(webSocketService.onDisconnect).toHaveBeenCalledTimes(1);
      expect(webSocketService.on).toHaveBeenCalledWith('exception', expect.any(Function));
      expect(webSocketService.on).toHaveBeenCalledWith('mode1:format1:match-started', expect.any(Function));
      expect(webSocketService.on).toHaveBeenCalledTimes(2);
      expect(webSocketService.emit).toHaveBeenCalledWith('mode1:format1:enqueue', { matchLanguage: "en" });
    });
  });

  it("should handle websocket match-started event", async () => {
    // Arrange
    let onHandler: any;
    (webSocketService.on as jest.Mock).mockImplementation((event, handler) => {
      if (event === "mode1:format1:match-started") {
        onHandler = handler;
      }
    });

    const fakeData = {
      matchId: "new-match-id",
      isOfferer: true,
      buddy: { id: "buddy1" },
      matchMode: "mode1",
    };

    renderHook(() => useMatchmaking());

    // Act
    await act(async () => {
      await onHandler(fakeData);
    });

    // Assert
    expect(useMatchStore().setMatchId).toHaveBeenCalledWith("new-match-id");
    expect(useMatchStore().setIsOfferer).toHaveBeenCalledWith(true);
    expect(useMatchStore().setUserBuddy).toHaveBeenCalledWith({ id: "buddy1" });
    expect(mockReplace).toHaveBeenCalledWith("/(private)/mode1/format1/game");
  });

  it("should handle websocket exception event", async () => {
    // Arrange
    let exceptionHandler: any;
    (webSocketService.on as jest.Mock).mockImplementation((event, handler) => {
      if (event === "exception") {
        exceptionHandler = handler;
      }
    });

    renderHook(() => useMatchmaking());

    const fakeError = { message: "Something broke" };

    // Act
    await act(async () => {
      await exceptionHandler(fakeError);
    });

    // Assert
    expect(Toast.show).toHaveBeenCalledWith({
      type: "error",
      text1: "Error",
      text2: "Something broke",
      position: "top",
    });
    expect(webSocketService.disconnect).toHaveBeenCalled();
    expect(useMatchStore().resetMatch).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/(private)/(tabs)/matches");
  });

  it("should handle websocket disconnect event", async () => {
    // Arrange
    let disconnectHandler: any;
    (webSocketService.onDisconnect as jest.Mock).mockImplementation((handler) => {
      disconnectHandler = handler;
    });

    renderHook(() => useMatchmaking());

    // Act
    await act(async () => {
      await disconnectHandler();
    });

    // Assert
    expect(webSocketService.disconnect).toHaveBeenCalled();
    expect(useMatchStore().resetMatch).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/(private)/(tabs)/matches");
  });
});
