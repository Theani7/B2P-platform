import { prisma } from "../../config/db.js";
import { AppError } from "../../shared/errors.js";

// NOTE: The Prisma `Conversation` model stores the owning collaboration id in the
// `campaignId` field (legacy `collaboration_id`); it is unique per collaboration.
const conversationInclude = {
  collaboration: {
    include: {
      campaign: true,
      businessProfile: { include: { user: true } },
      promoterProfile: { include: { user: true } },
    },
  },
};

function senderAvatar(user) {
  if (!user) return null;
  return user.promoterProfile?.avatarUrl || user.businessProfile?.logoUrl || null;
}

function toMessageRead(m, user) {
  return {
    id: m.id,
    conversationId: m.conversationId,
    senderId: m.senderId,
    senderAvatar: user ? senderAvatar(user) : null,
    message: m.message,
    messageType: m.messageType,
    editedAt: m.editedAt,
    readAt: m.readAt,
    isDeleted: m.isDeleted,
    createdAt: m.createdAt,
  };
}

function participantProfiles(user) {
  return [user.businessProfile?.id, user.promoterProfile?.id].filter(Boolean);
}

/**
 * Returns the conversation + its collaboration, throwing if the user is not a
 * participant (ADMIN is allowed to view any conversation for support).
 */
async function loadConversationForParticipant(userId, conversationId, user) {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: conversationInclude,
  });
  if (!conv) throw new AppError("Conversation not found", 404);

  const collab = conv.collaboration;
  const isParticipant =
    participantProfiles(user).includes(collab.businessProfileId) ||
    participantProfiles(user).includes(collab.promoterProfileId) ||
    user.role === "ADMIN";
  if (!isParticipant) throw new AppError("You are not a participant in this conversation", 403);

  return conv;
}

export async function getConversations(user, params = {}) {
  const { page = 1, limit = 50 } = params;
  const profileIds = participantProfiles(user);
  if (profileIds.length === 0) {
    return { items: [], total: 0, page: Number(page), limit: Number(limit), pages: 1 };
  }

  const collabs = await prisma.collaboration.findMany({
    where: {
      OR: [
        { businessProfileId: { in: profileIds } },
        { promoterProfileId: { in: profileIds } },
      ],
    },
    select: { id: true },
  });
  const collabIds = collabs.map((c) => c.id);

  let conversations = await prisma.conversation.findMany({
    where: { campaignId: { in: collabIds } },
    include: conversationInclude,
  });
  const existingCollabIds = new Set(conversations.map((c) => c.campaignId));
  const missing = collabIds.filter((id) => !existingCollabIds.has(id));
  if (missing.length) {
    await prisma.conversation.createMany({ data: missing.map((id) => ({ campaignId: id })) });
    const created = await prisma.conversation.findMany({
      where: { campaignId: { in: missing } },
      include: conversationInclude,
    });
    conversations = conversations.concat(created);
  }

  const convIds = conversations.map((c) => c.id);
  const messages =
    convIds.length > 0
      ? await prisma.message.findMany({
          where: { conversationId: { in: convIds } },
          orderBy: { createdAt: "desc" },
        })
      : [];

  const byConv = new Map();
  for (const m of messages) {
    if (!byConv.has(m.conversationId)) byConv.set(m.conversationId, []);
    byConv.get(m.conversationId).push(m);
  }

  const items = conversations.map((conv) => {
    const collab = conv.collaboration;
    const participants = [];
    if (collab.businessProfile?.user) {
      const bu = collab.businessProfile.user;
      participants.push({
        id: bu.id,
        name: bu.username,
        avatar: collab.businessProfile.logoUrl || "",
        role: "BUSINESS",
      });
    }
    if (collab.promoterProfile?.user) {
      const pu = collab.promoterProfile.user;
      participants.push({
        id: pu.id,
        name: pu.username,
        avatar: collab.promoterProfile.avatarUrl || "",
        role: "PROMOTER",
      });
    }

    const convMessages = byConv.get(conv.id) || [];
    const lastMessage = convMessages[0] || null;
    const unreadCount = convMessages.filter(
      (m) => m.senderId !== user.id && m.readAt === null
    ).length;

    return {
      id: conv.id,
      collaborationId: collab.id,
      participants,
      unreadCount,
      lastMessage: lastMessage
        ? {
            id: lastMessage.id,
            senderId: lastMessage.senderId,
            message: lastMessage.message,
            messageType: lastMessage.messageType,
            isDeleted: lastMessage.isDeleted,
            createdAt: lastMessage.createdAt,
          }
        : null,
      collaborationStatus: collab.status,
      campaignTitle: collab.campaign?.title ?? null,
      campaignBudget: collab.campaign ? Number(collab.campaign.budget) : null,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    };
  });

  items.sort((a, b) => {
    const da = a.lastMessage ? new Date(a.lastMessage.createdAt) : new Date(a.createdAt);
    const db = b.lastMessage ? new Date(b.lastMessage.createdAt) : new Date(b.createdAt);
    return db - da;
  });

  const total = items.length;
  const start = (Number(page) - 1) * Number(limit);
  const paged = items.slice(start, start + Number(limit));

  return {
    items: paged,
    total,
    page: Number(page),
    limit: Number(limit),
    pages: Math.max(1, Math.ceil(total / Number(limit))),
  };
}

export async function getOrCreateConversation(collaborationId, user) {
  const collab = await prisma.collaboration.findUnique({
    where: { id: collaborationId },
    include: { businessProfile: true, promoterProfile: true },
  });
  if (!collab) throw new AppError("Collaboration not found", 404);

  const isParticipant =
    participantProfiles(user).includes(collab.businessProfileId) ||
    participantProfiles(user).includes(collab.promoterProfileId) ||
    user.role === "ADMIN";
  if (!isParticipant) throw new AppError("You are not a participant in this collaboration", 403);

  let conv = await prisma.conversation.findUnique({ where: { campaignId: collaborationId } });
  if (!conv) {
    conv = await prisma.conversation.create({ data: { campaignId: collaborationId } });
  }
  return conv;
}

export async function canAccessConversation(user, conversationId) {
  try {
    await loadConversationForParticipant(user.id, conversationId, user);
    return true;
  } catch {
    return false;
  }
}

export async function getHistory(user, collaborationId, params = {}) {
  const { page = 1, limit = 50 } = params;
  const conv = await getOrCreateConversation(collaborationId, user);

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where: { conversationId: conv.id },
      orderBy: { createdAt: "desc" },
      skip: (Number(page) - 1) * Number(limit),
      take: Number(limit),
    }),
    prisma.message.count({ where: { conversationId: conv.id } }),
  ]);

  const senderIds = [...new Set(messages.map((m) => m.senderId))];
  const senders = await prisma.user.findMany({
    where: { id: { in: senderIds } },
    include: { businessProfile: true, promoterProfile: true },
  });
  const senderMap = new Map(senders.map((s) => [s.id, s]));

  const items = messages.map((m) => toMessageRead(m, senderMap.get(m.senderId)));

  return {
    items,
    total,
    page: Number(page),
    limit: Number(limit),
    pages: Math.max(1, Math.ceil(total / Number(limit))),
  };
}

export async function markConversationRead(user, conversationId) {
  await loadConversationForParticipant(user.id, conversationId, user);
  const updated = await prisma.message.updateMany({
    where: { conversationId, senderId: { not: user.id }, readAt: null },
    data: { readAt: new Date() },
  });
  return updated.count;
}

export async function editMessage(user, messageId, content) {
  const msg = await prisma.message.findUnique({ where: { id: messageId } });
  if (!msg) throw new AppError("Message not found", 404);
  if (msg.senderId !== user.id) throw new AppError("You can only edit your own messages", 403);
  if (msg.isDeleted) throw new AppError("Cannot edit a deleted message", 400);

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: { message: content, editedAt: new Date() },
  });
  return toMessageRead(updated, user);
}

export async function deleteMessage(user, messageId) {
  const msg = await prisma.message.findUnique({ where: { id: messageId } });
  if (!msg) throw new AppError("Message not found", 404);
  if (msg.senderId !== user.id) throw new AppError("You can only delete your own messages", 403);

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: { isDeleted: true, message: "This message was deleted.", readAt: msg.readAt || new Date() },
  });
  return toMessageRead(updated, user);
}

/**
 * Persist a chat message. Returns { error } on failure so the socket handler
 * can surface it without throwing (the socket layer is outside the Express
 * error pipeline).
 */
export async function sendChatMessage(userId, user, conversationId, text, messageType) {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      collaboration: {
        include: {
          businessProfile: { include: { user: true } },
          promoterProfile: { include: { user: true } },
        },
      },
    },
  });
  if (!conv) return { error: "Conversation not found" };

  const collab = conv.collaboration;
  const isParticipant =
    participantProfiles(user).includes(collab.businessProfileId) ||
    participantProfiles(user).includes(collab.promoterProfileId) ||
    user.role === "ADMIN";
  if (!isParticipant) return { error: "You are not a participant in this conversation" };

  if (collab.status !== "ACTIVE") {
    return { error: "You can only send messages for active collaborations." };
  }

  const msgType = ["IMAGE", "FILE"].includes(messageType) ? messageType : "TEXT";
  const message = await prisma.message.create({
    data: { conversationId, senderId: userId, message: text, messageType: msgType },
  });

  const otherUserId = participantProfiles(user).includes(collab.businessProfileId)
    ? collab.promoterProfile.userId
    : collab.businessProfile.userId;

  return {
    messageRead: toMessageRead(message, user),
    otherUserId,
    senderName: user.username,
    messageId: message.id,
  };
}
