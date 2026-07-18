import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  let adminId = null;
  for (const user of users) {
    if (user.role === 'ADMIN' || user.email === 'admin@b2pconnect.com') {
      adminId = user.id;
    }
  }

  if (adminId) {
    console.log("Admin user found:", adminId);
    
    // Deleting all related data
    try {
      await prisma.$transaction([
        prisma.message.deleteMany(),
        prisma.conversation.deleteMany(),
        
        prisma.deliverable.deleteMany(),
        prisma.review.deleteMany(),
        prisma.collaboration.deleteMany(),
        prisma.campaignApplication.deleteMany(),
        prisma.campaignInvitation.deleteMany(),
        prisma.matchResult.deleteMany(),
        prisma.campaign.deleteMany(), 
        
        prisma.portfolioMedia.deleteMany(),
        prisma.portfolioItem.deleteMany(),
        prisma.socialLink.deleteMany(),
        
        prisma.savedPromoter.deleteMany(),
        prisma.savedCampaign.deleteMany(),
        
        prisma.verificationRequest.deleteMany(),
        prisma.notification.deleteMany(),
        prisma.notificationPreference.deleteMany({ where: { userId: { not: adminId } } }),
        prisma.activityLog.deleteMany(),
        prisma.auditLog.deleteMany(),
        prisma.searchHistory.deleteMany(),
        
        prisma.promoterProfile.deleteMany(),
        prisma.businessProfile.deleteMany(),
        
        prisma.userAchievement.deleteMany(),
        
        prisma.user.deleteMany({ where: { id: { not: adminId } } }),
      ]);
      console.log("Deleted all non-admin users and their data.");
    } catch (e) {
      console.error(e);
    }
  } else {
    console.log("No admin user found. Wiping everything.");
    await prisma.user.deleteMany();
  }
}

main().finally(() => prisma.$disconnect());
