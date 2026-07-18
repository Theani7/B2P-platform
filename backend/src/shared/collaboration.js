import { prisma } from "../config/db.js";

/**
 * Create an ACTIVE collaboration from an accepted application or invitation.
 * Exactly one of applicationId / invitationId should be provided.
 */
export async function createCollaboration({
  campaignId,
  businessProfileId,
  promoterProfileId,
  applicationId = null,
  invitationId = null,
}) {
  return prisma.collaboration.create({
    data: {
      campaignId,
      businessProfileId,
      promoterProfileId,
      applicationId,
      invitationId,
      status: "ACTIVE",
      startedAt: new Date(),
    },
  });
}
