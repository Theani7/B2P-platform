import * as authService from "./service.js";
import { wrap } from "../../shared/errors.js";
import { ok } from "../../shared/response.js";

export const register = wrap(async (req, res) => {
  const tokens = await authService.register(req.body);
  return ok(res, tokens, "Registered", 201);
});

export const check = wrap(async (req, res) => {
  const result = await authService.checkAvailability(req.query);
  return ok(res, result, "Availability check");
});

export const login = wrap(async (req, res) => {
  const tokens = await authService.login(req.body);
  return ok(res, tokens, "Logged in");
});

export const logout = wrap(async (req, res) => {
  return ok(res, null, "Logged out");
});

export const refresh = wrap(async (req, res) => {
  const tokens = await authService.refresh(req.body.refresh_token);
  return ok(res, tokens, "Token refreshed");
});

export const verifyEmail = wrap(async (req, res) => {
  await authService.verifyEmail(req.body.token);
  return ok(res, null, "Email verified");
});

export const forgotPassword = wrap(async (req, res) => {
  await authService.forgotPassword(req.body.email);
  return ok(res, null, "If an account exists, a reset email was sent");
});

export const resetPassword = wrap(async (req, res) => {
  await authService.resetPassword(req.body.token, req.body.new_password);
  return ok(res, null, "Password reset successful");
});

export const me = wrap(async (req, res) => {
  return ok(res, req.user, "Current user");
});

export const updateMe = wrap(async (req, res) => {
  const user = await authService.updateMe(req.user, req.body);
  return ok(res, user, "Profile updated");
});


