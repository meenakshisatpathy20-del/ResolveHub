import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import validator from "validator";

import Organization from "../models/Organization.js";
import User from "../models/User.js";
import Dispute from "../models/Dispute.js";
import { notifyUsers } from "../utils/notify.js";
import serializeUser from "../utils/serializeUser.js";

const ORG_TYPES = [
  "Bank",
  "Merchant",
  "Payment Gateway",
  "E-commerce Platform",
  "Logistics Partner",
];

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

const serverError = (res, error) => {
  console.error(error);
  return fail(res, 500, "Something went wrong. Please try again.");
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const isOrgAdminOf = (user, orgId) =>
  user.role === "OrganizationAdmin" &&
  (user.organization?._id || user.organization)?.toString() ===
    orgId.toString();

const pickOrgFields = (body) => {
  const data = {};

  ["organizationName", "organizationType", "email", "phone", "address"].forEach(
    (key) => {
      if (typeof body[key] === "string") data[key] = body[key].trim();
    }
  );

  if (typeof body.isActive === "boolean") data.isActive = body.isActive;

  return data;
};

const validateOrg = (data, isUpdate = false) => {
  if (!isUpdate || "organizationName" in data) {
    if (!data.organizationName) return "Organization name is required.";
  }

  if (!isUpdate || "organizationType" in data) {
    if (!ORG_TYPES.includes(data.organizationType))
      return "Select a valid organization type.";
  }

  if (!isUpdate || "email" in data) {
    if (!data.email || !validator.isEmail(data.email))
      return "Enter a valid organization email.";
  }

  return null;
};

// ================================
// Create Organization (Admin)
// ================================

export const createOrganization = async (req, res) => {
  try {
    const data = pickOrgFields(req.body);
    const error = validateOrg(data);

    if (error) return fail(res, 400, error);

    const exists = await Organization.findOne({
      organizationName: data.organizationName,
    });

    if (exists) return fail(res, 400, "An organization with this name already exists.");

    const organization = await Organization.create(data);

    res.status(201).json({
      success: true,
      message: "Organization created.",
      organization,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// ================================
// Update Organization (Admin)
// ================================

export const updateOrganization = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 404, "Organization not found.");

    const data = pickOrgFields(req.body);
    const error = validateOrg(data, true);

    if (error) return fail(res, 400, error);

    const organization = await Organization.findByIdAndUpdate(
      req.params.id,
      data,
      { new: true, runValidators: true }
    );

    if (!organization) return fail(res, 404, "Organization not found.");

    res.status(200).json({
      success: true,
      message: "Organization updated.",
      organization,
    });
  } catch (error) {
    if (error.code === 11000) {
      return fail(res, 400, "An organization with this name already exists.");
    }
    return serverError(res, error);
  }
};

// ================================
// List Organizations
// Customers/staff get active orgs (for the dispute form);
// admins get everything with counts.
// ================================

export const getOrganizations = async (req, res) => {
  try {
    const filter = {};

    if (req.user.role !== "Admin") filter.isActive = true;

    if (req.query.type && ORG_TYPES.includes(req.query.type)) {
      filter.organizationType = req.query.type;
    }

    if (req.user.role !== "Admin") {
      const organizations = await Organization.find(filter)
        .select("organizationName organizationType")
        .sort({ organizationName: 1 });

      return res.status(200).json({ success: true, organizations });
    }

    const organizations = await Organization.find(filter)
      .sort({ organizationName: 1 })
      .lean();

    const [memberCounts, disputeCounts] = await Promise.all([
      User.aggregate([
        { $match: { organization: { $ne: null } } },
        { $group: { _id: "$organization", count: { $sum: 1 } } },
      ]),
      Dispute.aggregate([
        {
          $project: {
            orgs: ["$merchant", "$bank", "$paymentGateway"],
          },
        },
        { $unwind: "$orgs" },
        { $match: { orgs: { $ne: null } } },
        { $group: { _id: "$orgs", count: { $sum: 1 } } },
      ]),
    ]);

    const toMap = (rows) =>
      Object.fromEntries(rows.map((r) => [r._id.toString(), r.count]));

    const members = toMap(memberCounts);
    const disputes = toMap(disputeCounts);

    res.status(200).json({
      success: true,
      organizations: organizations.map((org) => ({
        ...org,
        employees: undefined,
        memberCount: members[org._id.toString()] || 0,
        disputeCount: disputes[org._id.toString()] || 0,
      })),
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// ================================
// Get Single Organization (Admin or its own staff)
// ================================

export const getOrganizationById = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 404, "Organization not found.");

    const userOrg = (req.user.organization?._id || req.user.organization)?.toString();

    if (req.user.role !== "Admin" && userOrg !== req.params.id) {
      return fail(res, 404, "Organization not found.");
    }

    const organization = await Organization.findById(req.params.id).select(
      "-employees"
    );

    if (!organization) return fail(res, 404, "Organization not found.");

    res.status(200).json({ success: true, organization });
  } catch (error) {
    return serverError(res, error);
  }
};

// ================================
// Members
// ================================

export const getMembers = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 404, "Organization not found.");

    if (req.user.role !== "Admin" && !isOrgAdminOf(req.user, req.params.id)) {
      return fail(res, 403, "You cannot view these members.");
    }

    const members = await User.find({ organization: req.params.id })
      .select("-password")
      .sort({ role: 1, fullName: 1 });

    const workload = await Dispute.aggregate([
      {
        $match: {
          assignedEmployee: { $in: members.map((m) => m._id) },
          status: { $nin: ["Resolved", "Rejected"] },
        },
      },
      { $group: { _id: "$assignedEmployee", count: { $sum: 1 } } },
    ]);

    const load = Object.fromEntries(
      workload.map((w) => [w._id.toString(), w.count])
    );

    res.status(200).json({
      success: true,
      members: members.map((m) => ({
        ...serializeUser(m),
        activeCases: load[m._id.toString()] || 0,
      })),
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// Admin: add OrganizationAdmin or Employee.
// OrganizationAdmin: add Employee to their own organization.
export const addMember = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 404, "Organization not found.");

    const isAdmin = req.user.role === "Admin";

    if (!isAdmin && !isOrgAdminOf(req.user, req.params.id)) {
      return fail(res, 403, "You cannot add members to this organization.");
    }

    const organization = await Organization.findById(req.params.id);

    if (!organization) return fail(res, 404, "Organization not found.");

    const { fullName, email, phoneNumber, password } = req.body;
    const role = isAdmin && req.body.role === "OrganizationAdmin"
      ? "OrganizationAdmin"
      : "Employee";

    if (!fullName?.trim()) return fail(res, 400, "Full name is required.");
    if (!email || !validator.isEmail(email)) return fail(res, 400, "Enter a valid email.");
    if (!password || password.length < 8)
      return fail(res, 400, "Temporary password must be at least 8 characters.");

    const normalizedEmail = email.toLowerCase().trim();

    if (await User.findOne({ email: normalizedEmail })) {
      return fail(res, 400, "A user with this email already exists.");
    }

    const employeeRoleByType = {
      Bank: "Bank",
      Merchant: "Merchant",
      "E-commerce Platform": "Merchant",
      "Payment Gateway": "Payment Gateway",
      "Logistics Partner": "Logistics",
    };

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      phoneNumber: phoneNumber?.trim() || "",
      password: await bcrypt.hash(password, 10),
      role,
      employeeRole: employeeRoleByType[organization.organizationType] || null,
      organization: organization._id,
      emailVerified: true,
    });

    await Organization.updateOne(
      { _id: organization._id },
      { $addToSet: { employees: user._id } }
    );

    await notifyUsers([user._id], {
      title: `Welcome to ${organization.organizationName}`,
      type: "Organization",
      message: `You were added as ${role === "OrganizationAdmin" ? "an organization admin" : "an employee"}. Please change your temporary password from Settings.`,
    });

    res.status(201).json({
      success: true,
      message: "Member added.",
      member: serializeUser(user),
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// Deactivate / reactivate a member
export const updateMemberStatus = async (req, res) => {
  try {
    const { id, userId } = req.params;

    if (!isValidId(id) || !isValidId(userId)) return fail(res, 404, "Member not found.");

    const isAdmin = req.user.role === "Admin";

    if (!isAdmin && !isOrgAdminOf(req.user, id)) {
      return fail(res, 403, "You cannot manage this member.");
    }

    if (userId === req.user._id.toString()) {
      return fail(res, 400, "You cannot change your own status.");
    }

    const member = await User.findOne({ _id: userId, organization: id });

    if (!member) return fail(res, 404, "Member not found.");

    if (!isAdmin && member.role !== "Employee") {
      return fail(res, 403, "Only an administrator can manage organization admins.");
    }

    const status = req.body.accountStatus;

    if (!["Active", "Inactive"].includes(status)) {
      return fail(res, 400, "Invalid status.");
    }

    member.accountStatus = status;
    await member.save();

    res.status(200).json({
      success: true,
      message: `Member ${status === "Active" ? "activated" : "deactivated"}.`,
      member: serializeUser(member),
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// ================================
// Delete Organization (Admin)
// Refused while disputes reference it — deactivate instead.
// ================================

export const deleteOrganization = async (req, res) => {
  try {
    if (!isValidId(req.params.id)) return fail(res, 404, "Organization not found.");

    const organization = await Organization.findById(req.params.id);

    if (!organization) return fail(res, 404, "Organization not found.");

    const inUse = await Dispute.exists({
      $or: [
        { merchant: organization._id },
        { bank: organization._id },
        { paymentGateway: organization._id },
      ],
    });

    if (inUse) {
      return fail(
        res,
        400,
        "This organization has disputes on record. Deactivate it instead of deleting."
      );
    }

    await User.updateMany(
      { organization: organization._id },
      { $set: { organization: null, accountStatus: "Inactive" } }
    );

    await organization.deleteOne();

    res.status(200).json({
      success: true,
      message: "Organization deleted successfully.",
    });
  } catch (error) {
    return serverError(res, error);
  }
};
