import { Server } from "socket.io";
import { verifyToken } from "./jwt.js";

/**
 * Socket.io infra for realtime notifications + chat.
 *
 * - On connect, the client must present a valid access token
 *   (socket.handshake.auth.token or ?token=). The userId is stored on the
 *   socket and the socket joins a private `user:<id>` room so notifications
 *   can be pushed directly to a user.
 * - Chat conversation rooms (`conversation:<id>`) are joined lazily by the
 *   chat socket handler after verifying participation.
 *
 * `io` is null until `initSocket` runs (called from src/index.js). Helpers
 * are no-ops before that, so `shared/notify.js` can safely call `emitToUser`
 * at any time.
 */
let io = null;

function userIdFromSocket(socket) {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) return null;
  try {
    const payload = verifyToken(token);
    if (payload.type !== "access" || !payload.sub) return null;
    return payload.sub;
  } catch {
    return null;
  }
}

export function initSocket(server) {
  io = new Server(server, {
    cors: { origin: "*", credentials: true },
  });

  io.on("connection", (socket) => {
    const userId = userIdFromSocket(socket);
    if (!userId) {
      socket.disconnect(true);
      return;
    }
    socket.userId = userId;
    socket.join(`user:${userId}`);
  });

  return io;
}

export function emitToUser(userId, event, payload) {
  if (!io || !userId) return;
  io.to(`user:${userId}`).emit(event, payload);
}

export function emitToConversation(conversationId, event, payload) {
  if (!io || !conversationId) return;
  io.to(`conversation:${conversationId}`).emit(event, payload);
}
