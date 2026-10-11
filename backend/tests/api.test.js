// End-to-end API tests: starts the server against a throwaway database,
// seeds demo data, and checks every role's permissions.
//
// Run:  TEST_MONGO_URI=mongodb://localhost:27017/resolvehub_test npm test
// The database in TEST_MONGO_URI is dropped at the start of the run.

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { spawn, spawnSync } from "node:child_process";
import mongoose from "mongoose";

const MONGO_URI = process.env.TEST_MONGO_URI;
const PORT = 5099;
const B = `http://localhost:${PORT}/api`;
const PDF = Buffer.from("%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n");

let server;
let serverOutput = "";

const env = {
  ...process.env,
  MONGO_URI,
  PORT: String(PORT),
  JWT_SECRET: "test-secret",
  NODE_ENV: "test",
  EMAIL_USER: "",
  EMAIL_PASS: "",
  CLOUDINARY_NAME: "",
  CLOUDINARY_API_KEY: "",
  CLOUDINARY_API_SECRET: "",
  REQUIRE_EMAIL_VERIFICATION: "true",
  SEED_PASSWORD: "Demo@1234",
};

before(async () => {
  assert.ok(MONGO_URI, "Set TEST_MONGO_URI to a disposable test database");

  await mongoose.connect(MONGO_URI);
  await mongoose.connection.dropDatabase();
  await mongoose.disconnect();

  const seed = spawnSync("node", ["seed.js"], { env, encoding: "utf8" });
  assert.equal(seed.status, 0, seed.stderr);

  server = spawn("node", ["server.js"], { env });
  server.stdout.on("data", (d) => (serverOutput += d));
  server.stderr.on("data", (d) => (serverOutput += d));

  for (let i = 0; i < 50; i++) {
    try {
      const r = await fetch(`${B}/health`);
      if (r.ok) return;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("Server did not start:\n" + serverOutput);
});

after(() => server?.kill());

const check = (name, cond, extra = "") => assert.ok(cond, `${name} ${extra}`);

const req = async (method, path, token, body, isForm) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body && !isForm) headers["Content-Type"] = "application/json";
  const r = await fetch(B + path, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });
  const ct = r.headers.get("content-type") || "";
  return { status: r.status, data: ct.includes("json") ? await r.json() : await r.text() };
};

const login = async (email) =>
  (await req("POST", "/auth/login", null, { email, password: "Demo@1234" })).data;

test("dispute workflow and role permissions", { skip: !MONGO_URI }, async () => {


    const cust = await login("customer@resolvehub.example");
    check("customer login", cust.token && cust.user.role === "Customer");
    const admin = (await login("admin@resolvehub.example")).token;
    const shopAdmin = (await login("admin@shopkart.example"));
    const shopAgent = (await login("agent@shopkart.example"));
    const bankAdmin = (await login("admin@nationalbank.example")).token;
    const bankAgent = (await login("agent@nationalbank.example")).token;
    check("org admin login has organization", shopAdmin.user.organization?.organizationName === "ShopKart");
    check("bad password rejected", (await req("POST","/auth/login",null,{email:"customer@resolvehub.example",password:"x"})).status === 401);

    // Signup with OTP (dev email -> console)
    let r = await req("POST","/auth/register",null,{fullName:"New User",email:"new@x.com",password:"Password1!"});
    check("register without OTP blocked", r.status === 400, JSON.stringify(r.data));
    r = await req("POST","/otp/send-email-otp",null,{email:"New@X.com"});
    check("send OTP (dev mode)", r.status === 200, JSON.stringify(r.data));
    const log = serverOutput;
    const otp = log.match(/new@x\.com.*?(\d{6})/)?.[1];
    check("OTP printed to console", !!otp);
    r = await req("POST","/otp/verify-email-otp",null,{email:"new@x.com",otp});
    check("verify OTP", r.status === 200, JSON.stringify(r.data));
    r = await req("POST","/auth/register",null,{fullName:"New User",email:"new@x.com",password:"Password1!", role:"Admin"});
    check("register after OTP, role forced Customer", r.status === 201 && r.data.user.role === "Customer" && r.data.user.emailVerified, JSON.stringify(r.data));
    const cust2 = r.data.token;

    // Orgs
    r = await req("GET","/organizations",cust.token);
    const orgs = r.data.organizations;
    check("customer lists orgs", orgs.length === 3);
    const shop = orgs.find(o=>o.organizationName==="ShopKart")._id;
    const bank = orgs.find(o=>o.organizationName==="National Bank")._id;
    const gw = orgs.find(o=>o.organizationName==="PayFlow Gateway")._id;

    // Create dispute
    const fd = new FormData();
    Object.entries({transactionId:"TXN123",orderId:"ORD9",amount:"2499",merchant:shop,bank,paymentGateway:gw,issueType:"Refund Pending",priority:"High",description:"Refund not received after 10 days of returning item.", status:"Resolved", customer: admin}).forEach(([k,v])=>fd.append(k,v));
    fd.append("evidence", new Blob([PDF],{type:"application/pdf"}), "receipt.pdf");
    r = await req("POST","/disputes",cust.token,fd,true);
    check("customer creates dispute w/ evidence", r.status === 201 && r.data.dispute.evidence.length === 1, JSON.stringify(r.data));
    check("protected fields ignored", r.data.dispute?.status === "Open");
    const d = r.data.dispute;

    const fd2 = new FormData();
    Object.entries({transactionId:"T",amount:"10",merchant:bank,issueType:"Other",description:"x".repeat(25)}).forEach(([k,v])=>fd2.append(k,v));
    r = await req("POST","/disputes",cust.token,fd2,true);
    check("merchant must be merchant type", r.status === 400, JSON.stringify(r.data));
    const fd3 = new FormData();
    Object.entries({transactionId:"T",amount:"10",merchant:shop,issueType:"Other",description:"x".repeat(25)}).forEach(([k,v])=>fd3.append(k,v));
    fd3.append("evidence", new Blob(["hi"],{type:"text/plain"}), "bad.txt");
    r = await req("POST","/disputes",cust.token,fd3,true);
    check("bad file type rejected", r.status === 400, JSON.stringify(r.data));
    r = await req("POST","/disputes",shopAdmin.token,fd2,true);
    check("org admin cannot create dispute", r.status === 403);

    // Access
    check("other customer cannot view", (await req("GET",`/disputes/${d._id}`,cust2)).status === 404);
    check("shop admin can view", (await req("GET",`/disputes/${d._id}`,shopAdmin.token)).status === 200);
    check("bank admin can view", (await req("GET",`/disputes/${d._id}`,bankAdmin)).status === 200);
    check("unassigned employee cannot view", (await req("GET",`/disputes/${d._id}`,shopAgent.token)).status === 404);
    check("customer cannot change status", (await req("PUT",`/disputes/${d._id}/status`,cust.token,{status:"Resolved"})).status === 403);
    r = await req("GET",`/disputes/${d._id}/evidence/${d.evidence[0]._id}`,cust.token);
    check("customer downloads evidence", r.status === 200 && String(r.data).startsWith("%PDF"));
    check("other customer cannot download evidence", (await req("GET",`/disputes/${d._id}/evidence/${d.evidence[0]._id}`,cust2)).status === 404);

    // Lists
    r = await req("GET","/disputes",cust.token); check("customer list", r.data.total === 1);
    r = await req("GET","/disputes",cust2); check("other customer list empty", r.data.total === 0);
    r = await req("GET","/disputes",shopAdmin.token); check("org admin list", r.data.total === 1);
    r = await req("GET","/disputes?search=TXN1",admin); check("admin search", r.data.total === 1);

    // Assign
    r = await req("GET",`/disputes/${d._id}/assignable-employees`,shopAdmin.token);
    check("assignable employees scoped to own org", r.data.employees.every(e=>e.organization.organizationName==="ShopKart") && r.data.employees.length===2);
    const bankAgentId = (await req("GET","/auth/profile",bankAgent)).data.user._id;
    check("org admin cannot assign other org's employee", (await req("PUT",`/disputes/${d._id}/assign`,shopAdmin.token,{employeeId:bankAgentId})).status === 403);
    r = await req("PUT",`/disputes/${d._id}/assign`,shopAdmin.token,{employeeId:shopAgent.user._id});
    check("assign to own employee", r.status === 200 && r.data.dispute.status === "In Progress", JSON.stringify(r.data));
    check("assigned employee can view", (await req("GET",`/disputes/${d._id}`,shopAgent.token)).status === 200);
    check("customer can no longer delete", (await req("DELETE",`/disputes/${d._id}`,cust.token)).status === 403);

    // Comments / status
    r = await req("POST",`/disputes/${d._id}/comments`,cust.token,{comment:"Any update?"});
    check("customer comments", r.status === 201);
    check("resolve requires remarks", (await req("PUT",`/disputes/${d._id}/status`,shopAgent.token,{status:"Resolved"})).status === 400);
    r = await req("PUT",`/disputes/${d._id}/status`,shopAgent.token,{status:"Resolved",remarks:"Refund processed, UTR 123"});
    check("employee resolves", r.status === 200 && r.data.dispute.resolvedAt);
    await new Promise((resolve) => setTimeout(resolve, 300));
    check("customer emailed on status change", /\[DEV EMAIL\] To: customer@resolvehub\.example \| Update on your dispute/.test(serverOutput), serverOutput.slice(-500));
    check("closed dispute locked for org", (await req("PUT",`/disputes/${d._id}/status`,shopAdmin.token,{status:"Open"})).status === 400);

    // Notifications
    r = await req("GET","/notifications",cust.token);
    check("customer notifications", r.data.notifications.length >= 3 && r.data.unread >= 3, JSON.stringify(r.data.notifications.map(n=>n.title)));
    r = await req("GET","/notifications",shopAgent.token);
    check("employee got assignment+comment notification", r.data.notifications.some(n=>n.type==="Assignment") && r.data.notifications.some(n=>n.type==="Comment"), JSON.stringify(r.data.notifications.map(n=>n.title)));
    r = await req("GET","/notifications",bankAdmin);
    check("bank admin notified of new dispute", r.data.notifications.some(n=>n.title==="New dispute received"));
    await req("PUT","/notifications/read-all",cust.token);
    check("read-all", (await req("GET","/notifications/unread-count",cust.token)).data.unread === 0);

    // Dashboard & reports
    r = await req("GET","/disputes/dashboard-summary",cust.token);
    check("customer summary", r.data.summary.total===1 && r.data.summary.resolved===1);
    r = await req("GET","/disputes/dashboard-summary",admin);
    check("admin summary has users/orgs", r.data.summary.users >= 9 && r.data.summary.organizations===3);
    r = await req("GET","/reports/summary",shopAdmin.token);
    check("report summary", r.status===200 && r.data.totals.total===1 && r.data.monthly.length===6 && r.data.totals.resolutionRate===100, JSON.stringify(r.data.totals));
    r = await req("GET","/reports/export/csv",cust.token);
    check("csv export", r.status===200 && r.data.includes("TXN123"));
    r = await req("GET","/reports/export/csv",cust2);
    check("csv scoped", !r.data.includes("TXN123"));

    // Org management
    r = await req("POST",`/organizations/${shop}/members`,shopAdmin.token,{fullName:"New Agent",email:"na@shop.example",password:"TempPass1",role:"OrganizationAdmin"});
    check("org admin adds employee (role forced Employee)", r.status===201 && r.data.member.role==="Employee", JSON.stringify(r.data));
    check("org admin cannot add to other org", (await req("POST",`/organizations/${bank}/members`,shopAdmin.token,{fullName:"X",email:"x@y.com",password:"TempPass1"})).status===403);
    r = await req("GET","/organizations",admin);
    check("admin org list w/ counts", r.data.organizations.find(o=>o._id===shop).memberCount===3);
    check("cannot delete org with disputes", (await req("DELETE",`/organizations/${shop}`,admin)).status===400);
    r = await req("POST","/organizations",admin,{organizationName:"QuickPay",organizationType:"Payment Gateway",email:"a@quickpay.example"});
    check("admin creates org", r.status===201);
    check("customer cannot create org", (await req("POST","/organizations",cust.token,{organizationName:"Z",organizationType:"Bank",email:"z@z.com"})).status===403);

    // Profile
    r = await req("PUT","/auth/change-password",cust2,{currentPassword:"wrong",newPassword:"NewPass123"});
    check("change password wrong current", r.status===400);
    r = await req("PUT","/auth/change-password",cust2,{currentPassword:"Password1!",newPassword:"NewPass123"});
    check("change password", r.status===200);
    check("invalid token 401", (await req("GET","/auth/profile","bad")).status===401);
    check("404 json", (await req("GET","/nope")).status===404);

    // Customer withdraw
    const fd4 = new FormData();
    Object.entries({transactionId:"T2",amount:"99",merchant:shop,issueType:"Other",description:"y".repeat(25)}).forEach(([k,v])=>fd4.append(k,v));
    r = await req("POST","/disputes",cust.token,fd4,true);
    check("customer withdraws open dispute", (await req("DELETE",`/disputes/${r.data.dispute._id}`,cust.token)).status===200);

});
