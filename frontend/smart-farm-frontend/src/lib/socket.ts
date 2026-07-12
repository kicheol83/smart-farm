import { io, Socket } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:3000";

let socket: Socket | null = null;

/**
 * MonitoringGateway (/monitoring namespace) bilan ulanish.
 * Backend: src/websocket/monitoring.gateway.ts
 *
 * Events: sensor-update, alert, device-status
 */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(`${SOCKET_URL}/monitoring`, {
      autoConnect: false,
      transports: ["websocket"],
      auth: (cb) => {
        cb({ token: localStorage.getItem("accessToken") });
      },
    });
  }
  return socket;
}

export function connectSocket(): void {
  const s = getSocket();
  if (!s.connected) s.connect();
}

export function disconnectSocket(): void {
  socket?.disconnect();
}
