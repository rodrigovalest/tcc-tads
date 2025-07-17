import { io as mockIo, Socket } from "socket.io-client";
import webSocketService from "../../services/web-socket-service";

jest.mock("socket.io-client");

describe("webSocketService", () => {
  let mockSocket: jest.Mocked<Socket>;

  beforeEach(() => {
    mockSocket = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
      connected: true,
      id: "123",
    } as any;

    (mockIo as jest.Mock).mockReturnValue(mockSocket);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should connect with correct token", () => {
    const jwtToken = "test-token";

    webSocketService.connect(jwtToken);

    expect(mockIo).toHaveBeenCalledWith(expect.anything(), {
      transports: ["websocket"],
      auth: {
        token: `Bearer ${jwtToken}`,
      },
    });
  });

  it("should emit events", () => {
    webSocketService.connect("token");
    webSocketService.emit("test-event", { payload: 123 });

    expect(mockSocket.emit).toHaveBeenCalledWith("test-event", { payload: 123 });
  });

  it("should register event listeners", () => {
    const callback = jest.fn();
    webSocketService.connect("token");
    webSocketService.on("custom-event", callback);

    expect(mockSocket.on).toHaveBeenCalledWith("custom-event", callback);
  });

  it("should register disconnect listener", () => {
    const callback = jest.fn();
    webSocketService.connect("token");
    webSocketService.onDisconnect(callback);

    expect(mockSocket.on).toHaveBeenCalledWith("disconnect", callback);
  });

  it("should remove event listeners without callback", () => {
    webSocketService.connect("token");
    webSocketService.off("custom-event");

    expect(mockSocket.off).toHaveBeenCalledWith("custom-event");
  });

  it("should remove event listeners with callback", () => {
    const callback = jest.fn();
    webSocketService.connect("token");
    webSocketService.off("custom-event", callback);

    expect(mockSocket.off).toHaveBeenCalledWith("custom-event", callback);
  });

  it("should return connection status", () => {
    webSocketService.connect("token");
    expect(webSocketService.isConnected()).toBe(true);

    (mockSocket.connected as boolean) = false;
    expect(webSocketService.isConnected()).toBe(false);
  });

  it("should disconnect and clear socket", () => {
    webSocketService.connect("token");
    webSocketService.disconnect();

    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});
