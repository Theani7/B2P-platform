import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "path";
import { config } from "./config/env.js";
import { errorHandler, notFoundHandler } from "./shared/errors.js";
import authRouter from "./modules/auth/routes.js";
import businessRouter from "./modules/business/routes.js";
import promoterRouter from "./modules/promoter/routes.js";
import promotersRouter from "./modules/promoters/routes.js";
import portfolioRouter from "./modules/portfolio/routes.js";
import portfolioMediaRouter from "./modules/portfolio-media/routes.js";
import socialRouter from "./modules/social/routes.js";
import profileCompletionRouter from "./modules/profileCompletion/routes.js";
import businessVerificationRouter from "./modules/verification/businessRoutes.js";
import promoterVerificationRouter from "./modules/verification/promoterRoutes.js";
import verificationAdminRouter from "./modules/verification/adminRoutes.js";
import campaignRouter from "./modules/campaign/routes.js";
import applicationsRouter from "./modules/applications/routes.js";
import invitationsRouter from "./modules/invitations/routes.js";
import collaborationsRouter from "./modules/collaborations/routes.js";
import marketplaceRouter from "./modules/marketplace/routes.js";
import matchingRouter from "./modules/matching/routes.js";
import reviewsRouter from "./modules/reviews/routes.js";
import activityRouter from "./modules/activity/routes.js";
import achievementsRouter from "./modules/achievements/routes.js";
import notificationsRouter from "./modules/notifications/routes.js";
import chatRouter from "./modules/chat/routes.js";
import sharingRouter from "./modules/sharing/routes.js";
import uploadRouter from "./modules/upload/routes.js";
import searchRouter from "./modules/search/routes.js";
import exportRouter from "./modules/export/routes.js";
import settingsRouter, { accountRouter as settingsAccountRouter } from "./modules/settings/routes.js";
import adminRouter from "./modules/admin/routes.js";
import aiRouter from "./modules/ai/routes.js";
import { uploadBaseDir } from "./modules/upload/service.js";

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: config.allowedOrigins,
      credentials: true,
    })
  );
  app.use(helmet());
  app.use(express.json());
  app.use("/uploads", express.static(uploadBaseDir()));

  // Rate limit auth endpoints (mirrors RateLimitMiddleware on /auth).
  app.use(
    `${config.apiV1}/auth`,
    rateLimit({ windowMs: 60 * 1000, max: config.rateLimitAuth })
  );

  app.get("/health", (req, res) => {
    res.json({
      status: "healthy",
      version: "1.0.0",
      database: "healthy",
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/ready", (req, res) => res.json({ status: "ready", database: "connected" }));
  app.get("/version", (req, res) =>
    res.json({ name: "Byparsathy", version: "1.0.0", api_version: "v1", environment: "production" })
  );

  // Routers
  app.use(`${config.apiV1}/auth`, authRouter);
  // Public platform settings are mounted BEFORE the root-mounted routers so an
  // unauthenticated GET /settings is served here instead of being intercepted
  // by a root router's `authenticate` middleware. The account sub-router
  // (authenticated) is mounted alongside it.
  app.use(`${config.apiV1}/settings`, settingsRouter);
  app.use(`${config.apiV1}/settings`, settingsAccountRouter);
  // Mount specific sub-paths BEFORE the general /business and /promoter routers,
  // so they are matched without passing through the base routers' role middleware.
  app.use(`${config.apiV1}/business/verification-request`, businessVerificationRouter);
  app.use(`${config.apiV1}/promoter/verification-request`, promoterVerificationRouter);
  app.use(`${config.apiV1}/verification-requests`, verificationAdminRouter);
  // Applications & invitations declare mixed-role routes at the api root
  // (e.g. /campaigns/:id/apply, /business/applications). They MUST mount before
  // the base /campaigns, /business, and /promoter routers so their per-route
  // role guards apply instead of a base router's blanket role middleware.
  app.use(config.apiV1, applicationsRouter);
  app.use(config.apiV1, invitationsRouter);
  // Matching & marketplace declare routes at the api root (e.g.
  // /campaigns/:campaignId/matches) and must mount before the base /campaigns
  // and /business routers so their paths are matched first.
  app.use(config.apiV1, matchingRouter);
  app.use(config.apiV1, marketplaceRouter);
  // Collaborations expose /business/collaborations and /promoter/collaborations;
  // mount before the base /business and /promoter routers to avoid their role
  // middleware capturing these more specific sub-paths.
  app.use(config.apiV1, collaborationsRouter);
  // Reviews declare mixed-role routes at the api root (/collaborations/:id/reviews,
  // /my/reviews, /users/:id/rating); mount before base routers.
  app.use(config.apiV1, reviewsRouter);
  app.use(`${config.apiV1}/campaigns`, campaignRouter);
  app.use(`${config.apiV1}/business`, businessRouter);
  app.use(`${config.apiV1}/promoter`, promoterRouter);
  app.use(`${config.apiV1}/promoters`, promotersRouter);
  app.use(`${config.apiV1}/portfolio`, portfolioRouter);
  app.use(`${config.apiV1}/portfolio`, portfolioMediaRouter);
  app.use(`${config.apiV1}/social`, socialRouter);
  app.use(`${config.apiV1}/profile-completion`, profileCompletionRouter);
  app.use(`${config.apiV1}/activity`, activityRouter);
  app.use(`${config.apiV1}/achievements`, achievementsRouter);
  app.use(`${config.apiV1}/notifications`, notificationsRouter);
  app.use(`${config.apiV1}/chat`, chatRouter);
  app.use(`${config.apiV1}/sharing`, sharingRouter);
  app.use(`${config.apiV1}/upload`, uploadRouter);
  app.use(`${config.apiV1}/search`, searchRouter);
  app.use(`${config.apiV1}/export`, exportRouter);
  app.use(`${config.apiV1}/admin`, adminRouter);
  app.use(`${config.apiV1}/ai`, aiRouter);

  // TODO: mount additional routers as ported:
  // app.use(`${config.apiV1}/campaigns`, campaignRouter);
  // app.use(`${config.apiV1}/marketplace`, marketplaceRouter);
  // ... etc

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
