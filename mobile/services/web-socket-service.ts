import { io, Socket } from "socket.io-client";

const wsApiUrl = process.env.EXPO_PUBLIC_WS_API_URL ?? '192.168.0.101:3000';

const webSocketService = (() => {
  let socket: Socket | null = null;
  const eventCallbacks: Map<string, Array<(data: any) => void>> = new Map();

  const registerAllListeners = () => {
    if (!socket) {
      return;
    }
    eventCallbacks.forEach((callbacks, event) => {
      if (socket) {
        socket.removeAllListeners(event);
        socket.on(event, (data: any) => {
          callbacks.forEach((cb, index) => {
            try {
              cb(data);
            } catch (error) {
            }
          });
        });
      }
    });
  };

  return {
    connect(jwtToken: string) {
      if (socket?.connected) {
        return;
      }
      if (socket) {
        socket.removeAllListeners();
        socket = null;
      }
      
      socket = io(wsApiUrl, {
        transports: ["websocket"],
        auth: {
          token: `Bearer ${jwtToken}`
        },
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socket.on('connect', () => {
        console.log('[webSocketService] ✅✅✅ CONECTADO! Socket ID:', socket?.id);
        registerAllListeners();
      });
      
      socket.on('reconnect', (attemptNumber) => {
        registerAllListeners();
      });
      
      socket.onAny((eventName, ...args) => {
        console.log(`[webSocketService] 📨 Evento: ${eventName}`, JSON.stringify(args).substring(0, 100));
      });

      socket.on('disconnect', (reason) => {
        console.log('[webSocketService] ❌ Desconectado. Razão:', reason);
      });

      socket.on('connect_error', (error) => {
        console.error('[webSocketService] 🚨 Erro ao conectar:', error);
      });
    },

    emit(event: string, data: any) {
      if (!socket?.connected) {
        return;
      }
      socket.emit(event, data);
    },

    on(event: string, callback: (data: any) => void) {
      if (!eventCallbacks.has(event)) {
        eventCallbacks.set(event, []);
      }
      
      const callbacks = eventCallbacks.get(event)!;
      if (callbacks.includes(callback)) {
        return;
      }
      
      callbacks.push(callback);
      if (socket?.connected) {
        registerAllListeners();
      }
    },

    onDisconnect(callback: (data: any) => void) {
      socket?.on("disconnect", callback);
    },

    off(event: string, callback?: (data: any) => void) {
      if (!callback) {
        socket?.removeAllListeners(event);
        eventCallbacks.delete(event);
      } else {
        const callbacks = eventCallbacks.get(event);
        if (callbacks) {
          const index = callbacks.indexOf(callback);
          if (index > -1) {
            callbacks.splice(index, 1);
          }
          
          if (callbacks.length === 0) {
            socket?.removeAllListeners(event);
            eventCallbacks.delete(event);
          } else if (socket?.connected) {
            socket.removeAllListeners(event);
            socket.on(event, (data: any) => {
              callbacks.forEach((cb, index) => {
                try {
                  cb(data);
                } catch (error) {
                  console.error(`[webSocketService] Erro no callback ${index + 1} para '${event}':`, error);
                }
              });
            });
          }
        }
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
