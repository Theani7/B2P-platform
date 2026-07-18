import { prisma } from "../../config/db.js";
import { emitToConversation } from "../../shared/socket.js";
import { createNotification } from "../../shared/notify.js";
import { sendChatMessage, canAccessConversation } from "./service.js";

async function loadUser(socket) {
  if (socket.user) return socket.user;
  try {
    socket.user = await prisma.user.findUnique({
      where: { id: socket.userId },
      include: { businessProfile: true, promoterProfile: true },
    });
  } catch {
    socket.user = null;
  }
  return socket.user;
}

/**
 * Registers socket.io chat handlers. Called once from src/index.js after the
 * io server is created. The base connection/auth + `user:<id>` room join is
 * handled in shared/socket.js; here we layer conversation rooms and messaging.
 *
 * Listeners are registered synchronously on connect and the user is loaded
 * lazily inside each handler (cached on the socket) so there is no race
 * between the async user lookup and the first client event.
 */
export function registerChatSocket(io) {
  io.on("connection", (socket) => {
    if (!socket.userId) return;

    socket.on("join_conversation", async ({ conversationId } = {}, cb) => {
      const user = await loadUser(socket);
      if (!user || !conversationId) {
        cb?.({ ok: false });
        return;
      }
      const allowed = await canAccessConversation(user, conversationId);
      if (!allowed) {
        socket.emit("error", { message: "Not authorized to join this conversation" });
        cb?.({ ok: false });
        return;
      }
      socket.join(`conversation:${conversationId}`);
      socket.emit("joined", { conversationId });
      cb?.({ ok: true, conversationId });
    });

    socket.on("message", async (data = {}) => {
      const user = await loadUser(socket);
      if (!user) return;
      const { conversationId, text, messageType } = data;
      if (!conversationId || !text) return;

      const result = await sendChatMessage(
        socket.userId,
        user,
        conversationId,
        String(text),
        messageType
      );
      if (result.error) {
        socket.emit("error", { message: result.error });
        return;
      }

      emitToConversation(conversationId, "message", result.messageRead);

      if (result.otherUserId) {
        createNotification({
          recipientId: result.otherUserId,
          actorId: socket.userId,
          type: "NEW_MESSAGE",
          title: "New Message",
          message: `You received a new message from ${result.senderName}`,
          entityType: "chat_message",
          entityId: result.messageId,
        });
      }
    });

    socket.on("typing_start", ({ conversationId } = {}) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit("typing_start", {
        conversationId,
        userId: socket.userId,
      });
    });

    socket.on("typing_stop", ({ conversationId } = {}) => {
      if (!conversationId) return;
      socket.to(`conversation:${conversationId}`).emit("typing_stop", {
        conversationId,
        userId: socket.userId,
      });
    });
  });
}
