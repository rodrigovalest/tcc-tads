import { io, Socket } from "socket.io-client";

const wsApiUrl = process.env.EXPO_PUBLIC_WS_API_URL ?? '192.168.1.22:3000';

const webSocketService = (() => {
  let socket: Socket | null = null;

  return {
    connect(jwtToken: string) {
      console.log('[WEBSOCKET] Conectando ao servidor:', wsApiUrl);
      socket = io(wsApiUrl, {
        transports: ["websocket"],
        auth: {
          token: `Bearer ${jwtToken}`
        }
      });

      socket.on('connect', () => {
        console.log('[WEBSOCKET] Conectado com sucesso!');
      });

      socket.on('disconnect', (reason) => {
        console.log('[WEBSOCKET] Desconectado:', reason);
      });

      socket.on('connect_error', (error) => {
        console.error('[WEBSOCKET] Erro de conexão:', error);
      });
    },

    emit(event: string, data: any) {
      socket?.emit(event, data);
    },

    on(event: string, callback: (data: any) => void) {
      socket?.on(event, callback);
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
      return socket?.connected ?? false;
    },

    disconnect() {
      socket?.disconnect();
      socket = null;
    }
  };
})();

export default webSocketService;
