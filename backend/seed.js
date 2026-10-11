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

  await upsertUser({
    fullName: "Demo Customer",
    email: "customer@resolvehub.example",
    role: "Customer",
  });

  console.log(`\nDone. New accounts use the password: ${DEMO_PASSWORD}`);
  await mongoose.disconnect();
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
