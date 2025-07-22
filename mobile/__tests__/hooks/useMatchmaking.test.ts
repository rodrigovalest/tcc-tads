import { renderHook, waitFor } from "@testing-library/react-native";
import useMatchmaking from "../../hooks/useMatchmaking";
import webSocketService from "../../services/web-socket-service";
import Toast from "react-native-toast-message";

// mocks
const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: mockPush,
  }),
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
}));

let mockToken: string | null = "valid-token";
let mockMatchStoreReturn: {
  matchFormat: string | null;
  matchLanguage: string | null;
  matchMode: string | null;
  setRoomId: jest.Mock;
  setIsOfferer: jest.Mock;
  resetMatch: jest.Mock;
  setUserBuddy: jest.Mock;
} = {
  matchFormat: "format1",
  matchLanguage: "en",
  matchMode: "mode1",
  setRoomId: jest.fn(),
  setIsOfferer: jest.fn(),
  resetMatch: jest.fn(),
  setUserBuddy: jest.fn(),
};

jest.mock("../../store/auth-store", () => ({
  __esModule: true,
  default: () => ({
    token: mockToken,
  }),
}));

jest.mock("../../store/match-store", () => ({
  __esModule: true,
  default: () => mockMatchStoreReturn,
}));


describe("useMatchmaking", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockToken = "valid-token";
    mockMatchStoreReturn = {
      matchFormat: "format1",
      matchLanguage: "en",
      matchMode: "mode1",
      setRoomId: jest.fn(),
      setIsOfferer: jest.fn(),
      resetMatch: jest.fn(),
      setUserBuddy: jest.fn(),
    };
  });

  it("should reset, disconnect and redirect if missing token or params", async () => {
    mockToken = null;
    mockMatchStoreReturn.matchFormat = null;
    mockMatchStoreReturn.matchLanguage = null;
    mockMatchStoreReturn.matchMode = null;

    renderHook(() => useMatchmaking());

    await waitFor(() => {
      expect(mockMatchStoreReturn.resetMatch).toHaveBeenCalled();
      expect(webSocketService.disconnect).toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith("/(private)/(tabs)/matches");
    });
  });

  it("should connect websocket and set listeners", async () => {
    renderHook(() => useMatchmaking());

    expect(webSocketService.connect).toHaveBeenCalledWith("valid-token");
    expect(webSocketService.on).toHaveBeenCalledWith("disconnect", expect.any(Function));
    expect(webSocketService.on).toHaveBeenCalledWith("exception", expect.any(Function));
    expect(webSocketService.on).toHaveBeenCalledWith("mode1:format1:match-started", expect.any(Function));
    expect(webSocketService.emit).toHaveBeenCalledWith("mode1:format1:enqueue", {
      matchLanguage: "en",
    });
  });

  it("should handle disconnect event by resetting, disconnecting and redirecting", async () => {
    let disconnectHandler: () => void = () => {};
    (webSocketService.on as jest.Mock).mockImplementation((event, cb) => {
      if (event === "disconnect") disconnectHandler = cb;
    });

    renderHook(() => useMatchmaking());

    await disconnectHandler();

    expect(webSocketService.disconnect).toHaveBeenCalled();
    expect(mockMatchStoreReturn.resetMatch).toHaveBeenCalled();
    expect(mockReplace).toHaveBeenCalledWith("/(private)/(tabs)/matches");
  });

  it("should handle exception event by showing toast, resetting, disconnecting and pushing route", async () => {
    const error = { message: "Test error" };
    let exceptionHandler: (err: any) => void = () => {};
    (webSocketService.on as jest.Mock).mockImplementation((event, cb) => {
      if (event === "exception") exceptionHandler = cb;
    });

    renderHook(() => useMatchmaking());

    await exceptionHandler(error);

    expect(Toast.show).toHaveBeenCalledWith({
      type: "error",
      text1: "Error",
      text2: "Test error",
      position: "top",
    });
    expect(webSocketService.disconnect).toHaveBeenCalled();
    expect(mockMatchStoreReturn.resetMatch).toHaveBeenCalled();
    expect(mockPush).toHaveBeenCalledWith("/(private)/(tabs)/matches");
  });

  it("should handle match-started event by setting store and navigating", async () => {
    const setRoomId = jest.fn();
    const setIsOfferer = jest.fn();
    const setUserBuddy = jest.fn();

    mockMatchStoreReturn = {
      matchFormat: "format1",
      matchLanguage: "en",
      matchMode: "mode1",
      setRoomId,
      setIsOfferer,
      resetMatch: jest.fn(),
      setUserBuddy,
    };

    let matchStartedHandler: (data: any) => void = () => {};
    (webSocketService.on as jest.Mock).mockImplementation((event, cb) => {
      if (event === "mode1:format1:match-started") matchStartedHandler = cb;
    });

    renderHook(() => useMatchmaking());

    const data = {
      roomId: "room123",
      isOfferer: true,
      buddy: { id: "buddyId" },
      matchMode: "mode1",
    };

    await matchStartedHandler(data);

    expect(setRoomId).toHaveBeenCalledWith("room123");
    expect(setIsOfferer).toHaveBeenCalledWith(true);
    expect(setUserBuddy).toHaveBeenCalledWith({ id: "buddyId" });
    expect(mockReplace).toHaveBeenCalledWith("/(private)/mode1/format1/game");
  });
});
