// =======================================
// Seed script
// Creates a platform admin and demo organizations with staff
// so every role can be tried out.
//
// Usage:  npm run seed
// Safe to re-run: existing records (matched by email / name) are kept.
// =======================================

import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import User from "./models/User.js";
import Organization from "./models/Organization.js";
import Dispute, { SLA_DAYS } from "./models/Dispute.js";
import Notification from "./models/Notification.js";

const DEMO_PASSWORD = process.env.SEED_PASSWORD || "Demo@1234";

const organizations = [
  {
    organizationName: "ShopKart",
    organizationType: "E-commerce Platform",
    email: "support@shopkart.example",
    employeeRole: "Merchant",
    admin: { fullName: "Riya Sharma", email: "admin@shopkart.example" },
    employee: { fullName: "Arjun Mehta", email: "agent@shopkart.example" },
  },
  {
    organizationName: "National Bank",
    organizationType: "Bank",
    email: "disputes@nationalbank.example",
    employeeRole: "Bank",
    admin: { fullName: "Priya Nair", email: "admin@nationalbank.example" },
    employee: { fullName: "Karan Gupta", email: "agent@nationalbank.example" },
  },
  {
    organizationName: "PayFlow Gateway",
    organizationType: "Payment Gateway",
    email: "ops@payflow.example",
    employeeRole: "Payment Gateway",
    admin: { fullName: "Vikram Rao", email: "admin@payflow.example" },
    employee: { fullName: "Sneha Iyer", email: "agent@payflow.example" },
  },
];

const upsertUser = async (data) => {
  const existing = await User.findOne({ email: data.email });

  if (existing) {
    console.log(`  • exists   ${data.email}`);
    return existing;
  }

  const user = await User.create({
    ...data,
    password: await bcrypt.hash(DEMO_PASSWORD, 10),
    emailVerified: true,
  });

  console.log(`  • created  ${data.email} (${data.role})`);
  return user;
};

// ---------------------------------------
// Sample disputes for the demo customer, so every
// dashboard, list and report has something to show.
// Only added when the demo customer has no disputes yet.
// ---------------------------------------

const DAY = 24 * 60 * 60 * 1000;

const seedSampleDisputes = async (customer) => {
  if (await Dispute.exists({ customer: customer._id })) {
    console.log("\nSample disputes — exist");
    return;
  }

  const org = async (name) => Organization.findOne({ organizationName: name });
  const user = async (email) => User.findOne({ email });

  const shop = await org("ShopKart");
  const bank = await org("National Bank");
  const gateway = await org("PayFlow Gateway");
  const shopAdmin = await user("admin@shopkart.example");
  const shopAgent = await user("agent@shopkart.example");
  const bankAgent = await user("agent@nationalbank.example");

  const by = (u) => ({ performedBy: u._id, performedByName: u.fullName });

  const samples = [
    {
      daysAgo: 1,
      transactionId: "UPI428731905512",
      orderId: "SK-90412",
      amount: 2499,
      issueType: "Refund Pending",
      priority: "High",
      status: "Open",
      currentStage: "Merchant Review",
      description:
        "I returned a pair of headphones on 2 October and the pickup was confirmed, but the refund of ₹2,499 has still not reached my account.",
      timeline: [{ action: "Dispute raised", stage: "Customer Submitted", ...by(customer) }],
    },
    {
      daysAgo: 6,
      transactionId: "UPI427615530981",
      orderId: "SK-88731",
      amount: 1899,
      issueType: "Duplicate Payment",
      priority: "High",
      status: "In Progress",
      currentStage: "Merchant Review",
      assignedEmployee: shopAgent,
      assignedOrganization: shop,
      description:
        "I was charged twice for order SK-88731. Both debits of ₹1,899 appear in my bank statement on the same day.",
      timeline: [
        { action: "Dispute raised", stage: "Customer Submitted", ...by(customer) },
        { action: "Assigned to Arjun Mehta (ShopKart)", stage: "Merchant Review", ...by(shopAdmin) },
      ],
      comments: [
        { user: customer, comment: "Please refund the duplicate amount to my original UPI account." },
        { user: shopAgent, comment: "Thanks — we can see both captures. We're confirming with the gateway and will update you within 2 days." },
      ],
    },
    {
      daysAgo: 20,
      transactionId: "NB0091827364",
      amount: 5000,
      issueType: "Payment Failed",
      priority: "Critical",
      status: "Awaiting Bank",
      currentStage: "Bank Verification",
      assignedEmployee: bankAgent,
      assignedOrganization: bank,
      description:
        "The payment failed on the merchant page but ₹5,000 was debited from my account. The order was never placed.",
      timeline: [
        { action: "Dispute raised", stage: "Customer Submitted", ...by(customer) },
        { action: "Assigned to Karan Gupta (National Bank)", stage: "Bank Verification", ...by(bankAgent) },
        {
          action: "Status changed from In Progress to Awaiting Bank",
          stage: "Bank Verification",
          remarks: "Reversal request raised with the settlement team.",
          ...by(bankAgent),
        },
      ],
    },
    {
      daysAgo: 45,
      transactionId: "UPI419283746650",
      orderId: "SK-71204",
      amount: 749,
      issueType: "Wrong Amount",
      priority: "Medium",
      status: "Resolved",
      currentStage: "Resolved",
      assignedEmployee: shopAgent,
      assignedOrganization: shop,
      resolvedAfterDays: 4,
      description: "The product was listed at ₹599 but I was charged ₹749 at checkout.",
      timeline: [
        { action: "Dispute raised", stage: "Customer Submitted", ...by(customer) },
        { action: "Assigned to Arjun Mehta (ShopKart)", stage: "Merchant Review", ...by(shopAdmin) },
        {
          action: "Status changed from In Progress to Resolved",
          stage: "Resolved",
          remarks: "Price difference of ₹150 refunded to the original payment method.",
          ...by(shopAgent),
        },
      ],
    },
    {
      daysAgo: 75,
      transactionId: "CARD5521093384",
      orderId: "SK-60318",
      amount: 3200,
      issueType: "Chargeback",
      priority: "Low",
      status: "Rejected",
      currentStage: "Rejected",
      assignedEmployee: shopAgent,
      assignedOrganization: shop,
      description: "I want to reverse this card payment because the item arrived late.",
      timeline: [
        { action: "Dispute raised", stage: "Customer Submitted", ...by(customer) },
        {
          action: "Status changed from In Progress to Rejected",
          stage: "Rejected",
          remarks: "The order was delivered and signed for within the promised window, so a chargeback doesn't apply.",
          ...by(shopAgent),
        },
      ],
    },
  ];

  for (const sample of samples) {
    const createdAt = new Date(Date.now() - sample.daysAgo * DAY);
    const closed = ["Resolved", "Rejected"].includes(sample.status);
    const closedAt = closed
      ? new Date(createdAt.getTime() + (sample.resolvedAfterDays || 6) * DAY)
      : undefined;

    const dispute = await Dispute.create({
      transactionId: sample.transactionId,
      orderId: sample.orderId || "",
      transactionDate: new Date(createdAt.getTime() - DAY),
      amount: sample.amount,
      customer: customer._id,
      merchant: shop._id,
      bank: bank._id,
      paymentGateway: gateway._id,
      assignedOrganization: (sample.assignedOrganization || shop)._id,
      assignedEmployee: sample.assignedEmployee?._id || null,
      currentStage: sample.currentStage,
      issueType: sample.issueType,
      priority: sample.priority,
      status: sample.status,
      description: sample.description,
      slaDeadline: new Date(createdAt.getTime() + SLA_DAYS[sample.priority] * DAY),
      resolvedAt: sample.status === "Resolved" ? closedAt : undefined,
      closedAt,
      timeline: sample.timeline.map((entry, i) => ({
        ...entry,
        createdAt: new Date(createdAt.getTime() + i * (closed ? DAY * 2 : DAY / 2)),
      })),
      comments: (sample.comments || []).map((c, i) => ({
        user: c.user._id,
        userName: c.user.fullName,
        userRole: c.user.role,
        organization: c.user.organization || null,
        comment: c.comment,
        createdAt: new Date(createdAt.getTime() + (i + 1) * DAY / 3),
      })),
    });

    // Backdate (timestamps would otherwise be "now")
    await Dispute.collection.updateOne(
      { _id: dispute._id },
      { $set: { createdAt, updatedAt: closedAt || new Date(createdAt.getTime() + DAY / 2) } }
    );
  }

  const latest = await Dispute.find({ customer: customer._id }).sort({ createdAt: -1 }).limit(2);

  await Notification.insertMany([
    {
      receiver: customer._id,
      title: "Your dispute is being handled",
      message: `Dispute ${latest[1].disputeId} has been assigned to ShopKart for review.`,
      dispute: latest[1]._id,
    },
    {
      receiver: shopAdmin._id,
      title: "New dispute received",
      message: `Dispute ${latest[0].disputeId} (₹2,499, Refund Pending) involves your organization.`,
      dispute: latest[0]._id,
    },
    {
      receiver: shopAgent._id,
      title: "New dispute assigned",
      type: "Assignment",
      message: `You have been assigned dispute ${latest[1].disputeId}.`,
      dispute: latest[1]._id,
    },
  ]);

  console.log(`\nSample disputes — created ${samples.length}`);
};

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected. Seeding…\n");

  await upsertUser({
    fullName: "Platform Admin",
    email: process.env.SEED_ADMIN_EMAIL || "admin@resolvehub.example",
    role: "Admin",
  });

  for (const def of organizations) {
    let org = await Organization.findOne({
      organizationName: def.organizationName,
    });

    if (!org) {
      org = await Organization.create({
        organizationName: def.organizationName,
        organizationType: def.organizationType,
        email: def.email,
      });
      console.log(`\n${def.organizationName} — created`);
    } else {
      console.log(`\n${def.organizationName} — exists`);
    }

    const admin = await upsertUser({
      ...def.admin,
      role: "OrganizationAdmin",
      employeeRole: def.employeeRole,
      organization: org._id,
    });

    const employee = await upsertUser({
      ...def.employee,
      role: "Employee",
      employeeRole: def.employeeRole,
      organization: org._id,
    });

    await Organization.updateOne(
      { _id: org._id },
      { $addToSet: { employees: { $each: [admin._id, employee._id] } } }
    );
  }

  const customer = await upsertUser({
    fullName: "Demo Customer",
    email: "customer@resolvehub.example",
    role: "Customer",
  });

  if (process.env.SEED_SAMPLE_DATA !== "false") {
    await seedSampleDisputes(customer);
  }

  console.log(`\nDone. New accounts use the password: ${DEMO_PASSWORD}`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
