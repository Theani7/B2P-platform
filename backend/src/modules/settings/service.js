import { prisma } from "../../config/db.js";

export async function getPublicSettings() {
  const settings = await prisma.platformSetting.findMany({
    orderBy: { settingKey: "asc" },
  });
  return settings.map((s) => ({
    id: s.id,
    settingKey: s.settingKey,
    settingValue: s.settingValue,
    description: s.description,
    updatedAt: s.updatedAt,
  }));
}

export async function getAccountSettings(user) {
  const prefs = await prisma.notificationPreference.findMany({
    where: { userId: user.id },
  });
  return {
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
    },
    promoterProfile: user.promoterProfile
      ? { username: user.promoterProfile.username, niche: user.promoterProfile.niche }
      : null,
    businessProfile: user.businessProfile
      ? { companyName: user.businessProfile.companyName }
      : null,
    notificationPreferences: prefs,
  };
}
