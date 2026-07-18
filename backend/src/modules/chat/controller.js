import * as chatService from "./service.js";
import { ok } from "../../shared/response.js";
import { AppError } from "../../shared/errors.js";

function wrap(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (e) {
      next(e);
    }
  };
}

export const listConversations = wrap(async (req, res) => {
  const data = await chatService.getConversations(req.user, req.query);
  return ok(res, data, "Conversations");
});

export const history = wrap(async (req, res) => {
  const data = await chatService.getHistory(req.user, req.params.collaborationId, req.query);
  return ok(res, data, "Conversation history");
});

export const markRead = wrap(async (req, res) => {
  const updated = await chatService.markConversationRead(req.user, req.params.conversationId);
  return ok(res, { updatedCount: updated }, "Conversation marked as read");
});

export const editMessage = wrap(async (req, res) => {
  const data = await chatService.editMessage(req.user, req.params.messageId, req.body.content);
  return ok(res, data, "Message updated");
});

export const deleteMessage = wrap(async (req, res) => {
  const data = await chatService.deleteMessage(req.user, req.params.messageId);
  return ok(res, data, "Message deleted");
});
