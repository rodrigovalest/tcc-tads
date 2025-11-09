import { io, Socket } from "socket.io-client";

const wsApiUrl = process.env.EXPO_PUBLIC_WS_API_URL ?? '192.168.0.101:3000';

const webSocketService = (() => {
  let socket: Socket | null = null;

  return {
    connect(jwtToken: string) {
      socket = io(wsApiUrl, {
        transports: ["websocket"],
        auth: {
          token: `Bearer ${jwtToken}`
        }
      });
    },

    emit(event: string, data: any) {
      socket?.emit(event, data);
    },

    on(event: string, callback: (data: any) => void) {
      socket?.on(event, (data: any) => {
        callback(data);
      });
    },

    onDisconnect(callback: (data: any) => void) {
      socket?.on("disconnect", callback);
    },

    off(event: string, callback?: (data: any) => void) {
      if (!callback) {
        socket?.off(event);
      } else {
        socket?.off(event, callback);
      }
    },

    isConnected: (): boolean => {
      const connected = socket?.connected ?? false;
      return connected;
    },

    disconnect() {
      socket?.disconnect();
      socket = null;
    },
    
    getSocketId: (): string | undefined => {
      return socket?.id;
    }
  };
})();

export default webSocketService;
