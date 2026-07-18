import { io as ioClient } from "socket.io-client";

const BASE = "http://localhost:8060";
const V = "/api/v1";
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==", "base64");
const TXT = Buffer.from("hello");

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function curl(method, path, token = "", body, isForm = false) {
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  let payload;
  if (isForm) {
    payload = body; // FormData
  } else {
    headers["Content-Type"] = "application/json";
    payload = body ? JSON.stringify(body) : undefined;
  }
  const res = await fetch(BASE + path, { method, headers, body: payload });
  let data = null;
  try { data = await res.json(); } catch {}
  return { code: res.status, data };
}
const tok = (r) => r.data?.data?.access_token || "";
const D = (r) => r.data?.data;
const uidFromTok = (t) => { try { return JSON.parse(Buffer.from(t.split(".")[1], "base64").toString()).sub; } catch { return null; } };
let fails = 0;
const assert = (cond, label) => { console.log(`${cond ? "PASS" : "FAIL"} : ${label}`); if (!cond) { fails++; } };

// ---------- Auth ----------
const admin = await curl("POST", `${V}/auth/login`, "", { email: "admin@gmail.com", password: "admin123" });
const ATOK = tok(admin);
assert(admin.code === 200 && ATOK, `admin login (${admin.code})`);

const bEmail = `biz_s8_${Date.now()}@b2p.dev`;
const pEmail = `pro_s8_${Date.now()}@b2p.dev`;
const b = await curl("POST", `${V}/auth/register`, "", { email: bEmail, password: "Passw0rd!", username: `bizs8${Date.now()}`, fullName: "Biz S8", role: "BUSINESS" });
const p = await curl("POST", `${V}/auth/register`, "", { email: pEmail, password: "Passw0rd!", username: `pros8${Date.now()}`, fullName: "Pro S8", role: "PROMOTER" });
const BTOK = tok(b), PTOK = tok(p);
const BUID = uidFromTok(BTOK), PUID = uidFromTok(PTOK);
const PUSERAUTH = D(p).username;
assert(b.code === 201 && p.code === 201, `register business+promoter (${b.code},${p.code})`);

const uEmail = `usr_s8_${Date.now()}@b2p.dev`;
const u = await curl("POST", `${V}/auth/register`, "", { email: uEmail, password: "Passw0rd!", username: `usrs8${Date.now()}`, fullName: "Usr S8", role: "PROMOTER" });
const UTOK = tok(u), UUID = uidFromTok(UTOK);

await curl("POST", `${V}/business/profile`, BTOK, { companyName: "S8 Co", industry: "Tech", description: "desc", location: "NY" });
const pprof = await curl("POST", `${V}/promoter/profile`, PTOK, { username: `pros8h${Date.now()}`, niche: "fitness", headline: "Fit", location: "LA" });
const PUSERNAME = D(pprof).username;

// ---------- Admin gating ----------
const noTok = await curl("GET", `${V}/admin/dashboard`, "");
assert(noTok.code === 401, `admin no-token -> 401 (${noTok.code})`);
const bizDash = await curl("GET", `${V}/admin/dashboard`, BTOK);
assert(bizDash.code === 403, `business admin -> 403 (${bizDash.code})`);

// ---------- Dashboard ----------
const dash = await curl("GET", `${V}/admin/dashboard`, ATOK);
assert(dash.code === 200 && D(dash).totalUsers >= 3, `admin dashboard (users=${D(dash)?.totalUsers})`);

// ---------- Users ----------
const users = await curl("GET", `${V}/admin/users`, ATOK);
assert(users.code === 200 && D(users).items.length >= 3, `admin users list (${D(users)?.items.length})`);
const searchUsers = await curl("GET", `${V}/admin/users?search=${PUNAME(PUSERAUTH)}`, ATOK);
assert(searchUsers.code === 200 && D(searchUsers).items.some((x) => x.id === PUID), `user search finds promoter (${D(searchUsers)?.total})`);
const userDetail = await curl("GET", `${V}/admin/users/${PUID}`, ATOK);
assert(userDetail.code === 200 && D(userDetail).id === PUID, `user detail (${userDetail.code})`);
const user404 = await curl("GET", `${V}/admin/users/00000000-0000-0000-0000-000000000000`, ATOK);
assert(user404.code === 404, `user detail missing -> 404 (${user404.code})`);

const susp = await curl("PATCH", `${V}/admin/users/${UUID}/suspend`, ATOK, {});
assert(susp.code === 200, `suspend user (${susp.code})`);
const suspendedProbe = await curl("GET", `${V}/notifications`, UTOK);
assert(suspendedProbe.code === 401, `suspended user token -> 401 (${suspendedProbe.code})`);
const act = await curl("PATCH", `${V}/admin/users/${UUID}/activate`, ATOK, {});
assert(act.code === 200, `activate user (${act.code})`);

const del = await curl("DELETE", `${V}/admin/users/${UUID}`, ATOK, {});
assert(del.code === 200, `delete user (${del.code})`);
const delDetail = await curl("GET", `${V}/admin/users/${UUID}`, ATOK);
assert(delDetail.code === 404, `deleted user -> 404 (${delDetail.code})`);
const delAdmin = await curl("DELETE", `${V}/admin/users/${uidFromTok(ATOK)}`, ATOK, {});
assert(delAdmin.code === 400, `cannot delete admin -> 400 (${delAdmin.code})`);

function PUNAME(p) { return encodeURIComponent(p); }

// ---------- Campaigns moderation ----------
const camp = await curl("POST", `${V}/campaigns`, BTOK, { title: "S8 Campaign", description: "A sufficiently long description for validation.", category: "fitness", budget: 1000, location: "NY", startDate: "2030-01-01T00:00:00.000Z", endDate: "2030-02-01T00:00:00.000Z", visibility: "PUBLIC", status: "DRAFT" });
const CID = D(camp).id;
await curl("POST", `${V}/campaigns/${CID}/publish`, BTOK, {});
const camps = await curl("GET", `${V}/admin/campaigns`, ATOK);
assert(camps.code === 200 && D(camps).items.some((c) => c.id === CID), `admin campaigns list (${D(camps)?.items.length})`);
const arch = await curl("PATCH", `${V}/admin/campaigns/${CID}/archive`, ATOK, {});
assert(arch.code === 200, `archive campaign (${arch.code})`);
const cancel = await curl("PATCH", `${V}/admin/campaigns/${CID}/cancel`, ATOK, {});
assert(cancel.code === 200, `cancel campaign (${cancel.code})`);
const camp404 = await curl("PATCH", `${V}/admin/campaigns/00000000-0000-0000-0000-000000000000/archive`, ATOK, {});
assert(camp404.code === 404, `archive missing -> 404 (${camp404.code})`);

// ---------- Reviews moderation ----------
const camp2 = await curl("POST", `${V}/campaigns`, BTOK, { title: "S8 Camp2", description: "Another sufficiently long description for validation.", category: "food", budget: 500, location: "LA", startDate: "2030-03-01T00:00:00.000Z", endDate: "2030-04-01T00:00:00.000Z", visibility: "PUBLIC", status: "DRAFT" });
const CID2 = D(camp2).id;
await curl("POST", `${V}/campaigns/${CID2}/publish`, BTOK, {});
await curl("POST", `${V}/campaigns/${CID2}/apply`, PTOK, { message: "pick me" });
const apps = await curl("GET", `${V}/business/applications`, BTOK);
const APPID = D(apps).items.find((a) => a.campaignId === CID2)?.id;
const acc2 = await curl("POST", `${V}/applications/${APPID}/accept`, BTOK, {});
const COLLAB2 = D(acc2).id;
await curl("POST", `${V}/collaborations/${COLLAB2}/complete`, PTOK, {});
const rev = await curl("POST", `${V}/collaborations/${COLLAB2}/reviews`, PTOK, { rating: 5, comment: "great collab s8" });
const RID = D(rev).id;
assert(rev.code === 201, `promoter review created (${rev.code})`);
const revBefore = await curl("GET", `${V}/admin/reviews`, ATOK);
const delRev = await curl("DELETE", `${V}/admin/reviews/${RID}`, ATOK, {});
assert(delRev.code === 200, `admin delete review (${delRev.code})`);
const revAfter = await curl("GET", `${V}/admin/reviews`, ATOK);
assert(D(revAfter).items.length === D(revBefore).items.length - 1, `review count decreased (${D(revBefore).items.length}->${D(revAfter).items.length})`);

// ---------- Audit logs ----------
const audit = await curl("GET", `${V}/admin/audit-logs`, ATOK);
assert(audit.code === 200 && D(audit).total >= 1, `audit logs present (${D(audit)?.total})`);
const auditFilter = await curl("GET", `${V}/admin/audit-logs?action=USER_SUSPENDED`, ATOK);
assert(auditFilter.code === 200 && D(auditFilter).items.every((l) => l.action === "USER_SUSPENDED"), `audit filter works (${D(auditFilter)?.total})`);

// ---------- Platform settings ----------
const setEmpty = await curl("GET", `${V}/admin/settings`, ATOK);
assert(setEmpty.code === 200, `settings list (${setEmpty.code})`);
const seed = await curl("POST", `${V}/admin/settings/seed`, ATOK, {});
assert(seed.code === 200, `seed settings (${seed.code})`);
const setAfter = await curl("GET", `${V}/admin/settings`, ATOK);
assert(D(setAfter).length === 4, `4 default settings (${D(setAfter).length})`);
const upd = await curl("PUT", `${V}/admin/settings/support_email`, ATOK, { settingValue: "new@b2p.com", description: "x" });
assert(upd.code === 200 && D(upd).settingValue === "new@b2p.com", `update setting (${upd.code})`);
const delSet = await curl("DELETE", `${V}/admin/settings/support_email`, ATOK, {});
assert(delSet.code === 200, `delete setting (${delSet.code})`);
const setFinal = await curl("GET", `${V}/admin/settings`, ATOK);
assert(!D(setFinal).some((s) => s.settingKey === "support_email"), `setting removed (${D(setFinal).length})`);
const pubSettings = await curl("GET", `${V}/settings`, "");
assert(pubSettings.code === 200 && Array.isArray(D(pubSettings)), `public settings (no auth) (${pubSettings.code})`);

// ---------- Account settings ----------
const acct = await curl("GET", `${V}/settings/account`, BTOK);
assert(acct.code === 200 && D(acct).user && Array.isArray(D(acct).notificationPreferences), `account settings (${acct.code})`);

// ---------- Search ----------
const s = await curl("GET", `${V}/search?q=${PUNAME(PUSERNAME)}`, PTOK);
assert(s.code === 200 && D(s).promoters.some((x) => x.title === PUSERNAME), `search promoters (${D(s)?.promoters.length})`);
const sBiz = await curl("GET", `${V}/search?q=S8`, ATOK);
assert(sBiz.code === 200 && D(sBiz).users.some((x) => x.id === BUID), `admin user search (${D(sBiz)?.users.length})`);
const sNonAdmin = await curl("GET", `${V}/search?q=S8&type=user`, PTOK);
assert(sNonAdmin.code === 200 && D(sNonAdmin).users.length === 0, `non-admin user search empty (${D(sNonAdmin)?.users.length})`);
const hist = await curl("GET", `${V}/search/history`, PTOK);
assert(hist.code === 200 && D(hist).some((h) => h.query === PUSERNAME), `search history (${D(hist)?.length})`);
const clr = await curl("DELETE", `${V}/search/history`, PTOK);
assert(clr.code === 200, `clear history (${clr.code})`);
const hist2 = await curl("GET", `${V}/search/history`, PTOK);
assert(hist2.code === 200 && D(hist2).length === 0, `history cleared (${D(hist2)?.length})`);

// ---------- Upload ----------
function form(file, name, type) {
  const fd = new FormData();
  fd.append("file", new Blob([file], { type }), name);
  return fd;
}
const upAv = await curl("POST", `${V}/upload/avatar`, PTOK, form(PNG, "a.png", "image/png"), true);
assert(upAv.code === 201 && D(upAv).url.includes("/uploads/avatars/"), `upload avatar (${upAv.code} ${D(upAv)?.url})`);
const avUrl = D(upAv).url;
const upBad = await curl("POST", `${V}/upload/avatar`, PTOK, form(TXT, "a.txt", "text/plain"), true);
assert(upBad.code === 400, `upload bad type -> 400 (${upBad.code})`);
const upLogo = await curl("POST", `${V}/upload/logo`, BTOK, form(PNG, "l.png", "image/png"), true);
assert(upLogo.code === 201 && D(upLogo).url.includes("/uploads/logos/"), `upload logo (${upLogo.code})`);
const upLogoForbidden = await curl("POST", `${V}/upload/logo`, PTOK, form(PNG, "l.png", "image/png"), true);
assert(upLogoForbidden.code === 403, `promoter logo -> 403 (${upLogoForbidden.code})`);
const upNoFile = await curl("POST", `${V}/upload/avatar`, PTOK, new FormData(), true);
assert(upNoFile.code === 400, `upload no file -> 400 (${upNoFile.code})`);
const fetchAv = await curl("GET", avUrl, "");
assert(fetchAv.code === 200, `serve uploaded file (${fetchAv.code})`);

// ---------- Export ----------
const expProf = await curl("POST", `${V}/export`, BTOK, { module: "profile", format: "json" });
assert(expProf.code === 201 && D(expProf).downloadUrl.includes("/uploads/exports/"), `export profile json (${expProf.code})`);
const expUrl = D(expProf).downloadUrl;
const fetchExp = await curl("GET", expUrl, "");
assert(fetchExp.code === 200, `serve export file (${fetchExp.code})`);
const expCamp = await curl("POST", `${V}/export`, BTOK, { module: "campaigns", format: "csv" });
assert(expCamp.code === 201, `export campaigns csv (${expCamp.code})`);
const expBad = await curl("POST", `${V}/export`, BTOK, { module: "nope" });
assert(expBad.code === 422, `export invalid module -> 422 (${expBad.code})`);

// ---------- Boot ----------
const health = await curl("GET", "/health", "");
assert(health.code === 200, `health (${health.code})`);
const ver = await curl("GET", "/version", "");
assert(ver.code === 200, `version (${ver.code})`);

console.log(`\nDONE. failures=${fails}`);
process.exit(fails ? 1 : 0);
