import { test, describe, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { prisma } from "../src/config/db.js";
import { ROLE } from "../src/shared/enums.js";
import * as uploadService from "../src/modules/upload/service.js";
import * as verificationService from "../src/modules/verification/service.js";
import { submitVerificationSchema } from "../src/modules/verification/validation.js";
import bcrypt from "bcryptjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe("Verification Document Feature Tests", () => {
  let promoterUser;
  let businessUser;
  let uploadedFilePath;

  beforeEach(async () => {
    const passwordHash = await bcrypt.hash("password123", 10);
    const suffix = Date.now() + Math.random().toString(36).substring(2, 6);

    promoterUser = await prisma.user.create({
      data: {
        username: `promoter_${suffix}`,
        fullName: "Promoter Tester",
        email: `promoter_${suffix}@test.com`,
        passwordHash,
        role: ROLE.PROMOTER,
        isActive: true,
        isVerified: true,
        promoterProfile: {
          create: {
            username: `promoter_${suffix}`,
            bio: "Promoter bio",
            niche: "TECH",
            verified: false,
          },
        },
      },
      include: { promoterProfile: true },
    });

    businessUser = await prisma.user.create({
      data: {
        username: `biz_${suffix}`,
        fullName: "Business Tester",
        email: `biz_${suffix}@test.com`,
        passwordHash,
        role: ROLE.BUSINESS,
        isActive: true,
        isVerified: true,
        businessProfile: {
          create: {
            companyName: `Company ${suffix}`,
            industry: "Tech",
            verified: false,
          },
        },
      },
      include: { businessProfile: true },
    });
  });

  afterEach(async () => {
    if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
      try {
        fs.unlinkSync(uploadedFilePath);
      } catch {}
    }
    await prisma.verificationRequest.deleteMany({
      where: {
        OR: [
          { promoterProfileId: promoterUser?.promoterProfile?.id },
          { businessProfileId: businessUser?.businessProfile?.id },
        ],
      },
    });
    if (promoterUser?.id) {
      await prisma.promoterProfile.deleteMany({ where: { userId: promoterUser.id } });
      await prisma.user.deleteMany({ where: { id: promoterUser.id } });
    }
    if (businessUser?.id) {
      await prisma.businessProfile.deleteMany({ where: { userId: businessUser.id } });
      await prisma.user.deleteMany({ where: { id: businessUser.id } });
    }
  });

  test("submitVerificationSchema validates inputs correctly", () => {
    // Valid input
    const valid = submitVerificationSchema.safeParse({
      documentUrl: "/uploads/documents/test.pdf",
      documentName: "registration_certificate.pdf",
    });
    assert.equal(valid.success, true);

    // Empty object
    const empty = submitVerificationSchema.safeParse({});
    assert.equal(empty.success, true);

    // Null values
    const withNulls = submitVerificationSchema.safeParse({
      documentUrl: null,
      documentName: null,
    });
    assert.equal(withNulls.success, true);

    // Too long documentUrl (> 1000 chars)
    const longUrl = submitVerificationSchema.safeParse({
      documentUrl: "a".repeat(1001),
    });
    assert.equal(longUrl.success, false);

    // Too long documentName (> 255 chars)
    const longName = submitVerificationSchema.safeParse({
      documentName: "a".repeat(256),
    });
    assert.equal(longName.success, false);
  });

  test("uploadService.saveUpload handles documents subfolder and .pdf", () => {
    const file = {
      originalname: "tax_document.pdf",
      buffer: Buffer.from("%PDF-1.4 test document content"),
    };
    const url = uploadService.saveUpload(file, "documents");
    assert.ok(url.startsWith("/uploads/documents/"));
    assert.ok(url.endsWith(".pdf"));

    const filename = path.basename(url);
    uploadedFilePath = path.join(uploadService.uploadBaseDir(), "documents", filename);
    assert.ok(fs.existsSync(uploadedFilePath));
  });

  test("submitBusiness stores documentUrl and documentName", async () => {
    const vr = await verificationService.submitBusiness(
      businessUser,
      {
        documentUrl: "/uploads/documents/business_cert.pdf",
        documentName: "business_cert.pdf",
      },
      {}
    );

    assert.ok(vr.id);
    assert.equal(vr.status, "PENDING");
    assert.equal(vr.documentUrl, "/uploads/documents/business_cert.pdf");
    assert.equal(vr.documentName, "business_cert.pdf");

    // Fetch via getMyBusinessRequests
    const list = await verificationService.getMyBusinessRequests(businessUser);
    assert.equal(list.length, 1);
    assert.equal(list[0].documentUrl, "/uploads/documents/business_cert.pdf");
    assert.equal(list[0].documentName, "business_cert.pdf");
    assert.equal(list[0].document_url, "/uploads/documents/business_cert.pdf");
    assert.equal(list[0].document_name, "business_cert.pdf");
  });

  test("submitPromoter stores documentUrl and documentName", async () => {
    const vr = await verificationService.submitPromoter(
      promoterUser,
      {
        documentUrl: "/uploads/documents/id_card.pdf",
        documentName: "id_card.pdf",
      },
      {}
    );

    assert.ok(vr.id);
    assert.equal(vr.status, "PENDING");
    assert.equal(vr.documentUrl, "/uploads/documents/id_card.pdf");
    assert.equal(vr.documentName, "id_card.pdf");

    // Fetch via getMyPromoterRequests
    const list = await verificationService.getMyPromoterRequests(promoterUser);
    assert.equal(list.length, 1);
    assert.equal(list[0].documentUrl, "/uploads/documents/id_card.pdf");
    assert.equal(list[0].documentName, "id_card.pdf");
    assert.equal(list[0].document_url, "/uploads/documents/id_card.pdf");
    assert.equal(list[0].document_name, "id_card.pdf");
  });

  test("listRequests returns documentUrl and documentName in records", async () => {
    await verificationService.submitPromoter(
      promoterUser,
      {
        documentUrl: "/uploads/documents/portfolio.pdf",
        documentName: "portfolio.pdf",
      },
      {}
    );

    const [items] = await verificationService.listRequests({ status: "PENDING" });
    const target = items.find((i) => i.promoterProfileId === promoterUser.promoterProfile.id);
    assert.ok(target);
    assert.equal(target.documentUrl, "/uploads/documents/portfolio.pdf");
    assert.equal(target.documentName, "portfolio.pdf");
  });

  test("controller.listRequests returns mapped documentUrl, documentName, document_url, document_name", async () => {
    const { listRequests } = await import("../src/modules/verification/controller.js");

    await verificationService.submitPromoter(
      promoterUser,
      {
        documentUrl: "/uploads/documents/portfolio2.pdf",
        documentName: "portfolio2.pdf",
      },
      {}
    );

    let jsonResult;
    let statusCode = 200;
    const req = {
      query: { status: "PENDING", page: 1, limit: 100 },
      user: { id: "admin-id", role: ROLE.ADMIN },
    };
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      },
    };

    await listRequests(req, res, () => {});

    assert.equal(statusCode, 200);
    assert.equal(jsonResult.success, true);
    const target = jsonResult.data.items.find(
      (i) => i.documentUrl === "/uploads/documents/portfolio2.pdf"
    );
    assert.ok(target);
    assert.equal(target.documentUrl, "/uploads/documents/portfolio2.pdf");
    assert.equal(target.documentName, "portfolio2.pdf");
    assert.equal(target.document_url, "/uploads/documents/portfolio2.pdf");
    assert.equal(target.document_name, "portfolio2.pdf");
  });

  test("uploadDocument rejects non-PDF files and accepts PDF files", async () => {
    const { uploadDocument } = await import("../src/modules/upload/controller.js");

    // Non-PDF file (.png)
    let errorCaught;
    const reqPng = {
      file: {
        originalname: "test.png",
        buffer: Buffer.from("fake-png-content"),
      },
    };
    const res = {};
    const nextPng = (err) => {
      errorCaught = err;
    };

    await uploadDocument(reqPng, res, nextPng);
    assert.ok(errorCaught);
    assert.equal(errorCaught.statusCode, 400);
    assert.equal(errorCaught.message, "Only PDF documents are allowed");

    // Non-PDF file (.txt)
    errorCaught = null;
    const reqTxt = {
      file: {
        originalname: "test.txt",
        buffer: Buffer.from("fake-txt-content"),
      },
    };
    await uploadDocument(reqTxt, res, (err) => {
      errorCaught = err;
    });
    assert.ok(errorCaught);
    assert.equal(errorCaught.statusCode, 400);
    assert.equal(errorCaught.message, "Only PDF documents are allowed");

    // Valid PDF file
    let jsonResult;
    let statusCode;
    const reqPdf = {
      file: {
        originalname: "valid.pdf",
        buffer: Buffer.from("%PDF-1.4 test"),
      },
    };
    const resPdf = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        jsonResult = data;
        return this;
      },
    };

    await uploadDocument(reqPdf, resPdf, (err) => {
      if (err) throw err;
    });

    assert.equal(statusCode, 201);
    assert.equal(jsonResult.success, true);
    assert.ok(jsonResult.data.url.startsWith("/uploads/documents/"));
    assert.ok(jsonResult.data.url.endsWith(".pdf"));

    // Cleanup uploaded file
    const filename = path.basename(jsonResult.data.url);
    const cleanupPath = path.join(uploadService.uploadBaseDir(), "documents", filename);
    if (fs.existsSync(cleanupPath)) {
      fs.unlinkSync(cleanupPath);
    }
  });
});
