import { io as mockIo, Socket } from "socket.io-client";
import webSocketService from "../../services/web-socket-service";

jest.mock("socket.io-client");

describe("webSocketService", () => {
  let mockSocket: jest.Mocked<Socket>;

  beforeEach(() => {
    webSocketService.disconnect();
    
    mockSocket = {
      on: jest.fn().mockReturnThis(),
      off: jest.fn().mockReturnThis(),
      emit: jest.fn().mockReturnThis(),
      disconnect: jest.fn(),
      removeAllListeners: jest.fn().mockReturnThis(),
      onAny: jest.fn().mockReturnThis(),
      connected: true,
      id: "123",
    } as any;

    (mockIo as jest.Mock).mockReturnValue(mockSocket);
  });

  afterEach(() => {
    jest.clearAllMocks();
    webSocketService.disconnect();
  });

  it("should connect with correct token", () => {
    const jwtToken = "test-token";

    webSocketService.connect(jwtToken);

    expect(mockIo).toHaveBeenCalledWith(expect.anything(), {
      transports: ["websocket"],
      auth: {
        token: `Bearer ${jwtToken}`,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });
  });

  it("should emit events", () => {
    webSocketService.connect("token");
    mockSocket.connected = true;
    webSocketService.emit("test-event", { payload: 123 });

    expect(mockSocket.emit).toHaveBeenCalledWith("test-event", { payload: 123 });
  });

  it("should register event listeners", () => {
    const callback = jest.fn();
    webSocketService.connect("token");
    mockSocket.connected = true;
    const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1];
    if (connectCallback) connectCallback();
    
    webSocketService.on("custom-event", callback);
    expect(mockSocket.removeAllListeners).toHaveBeenCalledWith("custom-event");
    expect(mockSocket.on).toHaveBeenCalledWith("custom-event", expect.any(Function));
  });

  it("should register disconnect listener", () => {
    const callback = jest.fn();
    webSocketService.connect("token");
    webSocketService.onDisconnect(callback);
    expect(mockSocket.on).toHaveBeenCalledWith("disconnect", expect.any(Function));
  });

  it("should remove event listeners without callback", () => {
    webSocketService.connect("token");
    webSocketService.on("custom-event", jest.fn());
    webSocketService.off("custom-event");

    expect(mockSocket.removeAllListeners).toHaveBeenCalledWith("custom-event");
  });

  it("should remove event listeners with callback", () => {
    const callback = jest.fn();
    webSocketService.connect("token");
    
    mockSocket.connected = true;
    const connectCallback = mockSocket.on.mock.calls.find(call => call[0] === 'connect')?.[1];
    if (connectCallback) connectCallback();
    webSocketService.on("custom-event", callback);
    jest.clearAllMocks();
    webSocketService.off("custom-event", callback);
    expect(mockSocket.removeAllListeners).toHaveBeenCalledWith("custom-event");
  });

  it("should return connection status", () => {
    expect(webSocketService.isConnected()).toBe(false);
    
    webSocketService.connect("token");
    mockSocket.connected = true;
    expect(webSocketService.isConnected()).toBe(true);

    mockSocket.connected = false;
    expect(webSocketService.isConnected()).toBe(false);
  });

  it("should disconnect and clear socket", () => {
    webSocketService.connect("token");
    webSocketService.disconnect();

    expect(mockSocket.disconnect).toHaveBeenCalled();
  });
});
