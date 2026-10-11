import fs from "fs";
import path from "path";
import mongoose from "mongoose";

import Dispute, {
  DISPUTE_STATUSES,
  DISPUTE_STAGES,
  CLOSED_STATUSES,
  ISSUE_TYPES,
  PRIORITIES,
} from "../models/Dispute.js";
import Organization from "../models/Organization.js";
import User from "../models/User.js";

import {
  scopeFilter,
  canViewDispute,
  canManageDispute,
  canAssignDispute,
  involvedOrgIds,
  userOrgId,
} from "../utils/disputeAccess.js";
import { notifyUsers, getOrgAdmins } from "../utils/notify.js";
import {
  filesToEvidence,
  UPLOAD_DIR,
} from "../middleware/uploadMiddleware.js";

// =======================================
// Helpers
// =======================================

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

const serverError = (res, error) => {
  console.error(error);
  return fail(res, 500, "Something went wrong. Please try again.");
};

const populateDispute = (query) =>
  query
    .populate("customer", "fullName email phoneNumber")
    .populate("merchant", "organizationName organizationType")
    .populate("bank", "organizationName organizationType")
    .populate("paymentGateway", "organizationName organizationType")
    .populate("assignedOrganization", "organizationName organizationType")
    .populate("assignedEmployee", "fullName email");

const timelineEntry = (user, action, extra = {}) => ({
  action,
  performedBy: user._id,
  performedByName: user.fullName,
  ...extra,
});

// Load a dispute and check that the user may see it
const loadAuthorizedDispute = async (req, res) => {
  if (!isValidId(req.params.id)) {
    fail(res, 404, "Dispute not found.");
    return null;
  }

  const dispute = await Dispute.findById(req.params.id);

  if (!dispute || !canViewDispute(req.user, dispute)) {
    // Same response for "missing" and "not yours" so IDs can't be probed
    fail(res, 404, "Dispute not found.");
    return null;
  }

  return dispute;
};

// Validate that an organization id exists, is active and of an allowed type
const resolveOrg = async (id, allowedTypes, label, required) => {
  if (!id) {
    if (required) throw new Error(`${label} is required.`);
    return null;
  }

  if (!isValidId(id)) throw new Error(`Invalid ${label}.`);

  const org = await Organization.findOne({ _id: id, isActive: true });

  if (!org || !allowedTypes.includes(org.organizationType)) {
    throw new Error(`Please select a valid ${label}.`);
  }

  return org._id;
};

const removeLocalFiles = (files = []) => {
  files.forEach((file) => {
    if (file.path && file.destination) {
      fs.unlink(file.path, () => {});
    }
  });
};

// =======================================
// Create Dispute (Customers only)
// =======================================

export const createDispute = async (req, res) => {
  try {
    if (req.user.role !== "Customer") {
      removeLocalFiles(req.files);
      return fail(res, 403, "Only customers can raise disputes.");
    }

    const {
      transactionId,
      orderId,
      transactionDate,
      amount,
      merchant,
      bank,
      paymentGateway,
      issueType,
      priority,
      description,
    } = req.body;

    const numericAmount = Number(amount);

    const errors = [];

    if (!transactionId?.trim()) errors.push("Transaction ID is required.");
    if (!numericAmount || numericAmount <= 0)
      errors.push("Enter a valid amount.");
    if (!ISSUE_TYPES.includes(issueType))
      errors.push("Select a valid issue type.");
    if (priority && !PRIORITIES.includes(priority))
      errors.push("Select a valid priority.");
    if (!description?.trim() || description.trim().length < 20)
      errors.push("Description must be at least 20 characters.");

    if (errors.length) {
      removeLocalFiles(req.files);
      return fail(res, 400, errors.join(" "));
    }

    let merchantId, bankId, gatewayId;

    try {
      merchantId = await resolveOrg(
        merchant,
        ["Merchant", "E-commerce Platform"],
        "merchant",
        true
      );
      bankId = await resolveOrg(bank, ["Bank"], "bank", false);
      gatewayId = await resolveOrg(
        paymentGateway,
        ["Payment Gateway"],
        "payment gateway",
        false
      );
    } catch (validationError) {
      removeLocalFiles(req.files);
      return fail(res, 400, validationError.message);
    }

    // Only whitelisted fields are used: status, customer,
    // assignment etc. can never be set from the request body.
    const dispute = await Dispute.create({
      transactionId: transactionId.trim(),
      orderId: orderId?.trim() || "",
      transactionDate: transactionDate ? new Date(transactionDate) : null,
      amount: numericAmount,
      customer: req.user._id,
      merchant: merchantId,
      bank: bankId,
      paymentGateway: gatewayId,
      assignedOrganization: merchantId,
      currentStage: "Merchant Review",
      issueType,
      priority: priority || "Medium",
      description: description.trim(),
      evidence: filesToEvidence(req.files, req.user._id),
      timeline: [
        timelineEntry(req.user, "Dispute raised", {
          stage: "Customer Submitted",
        }),
      ],
    });

    await notifyUsers([req.user._id], {
      title: "Dispute submitted",
      message: `Your dispute ${dispute.disputeId} has been submitted and sent for merchant review.`,
      dispute: dispute._id,
    });

    const orgAdmins = await getOrgAdmins(involvedOrgIds(dispute));

    await notifyUsers(orgAdmins, {
      title: "New dispute received",
      message: `Dispute ${dispute.disputeId} (₹${numericAmount.toLocaleString("en-IN")}, ${issueType}) involves your organization.`,
      dispute: dispute._id,
    });

    res.status(201).json({
      success: true,
      message: "Dispute created successfully.",
      dispute,
    });
  } catch (error) {
    removeLocalFiles(req.files);
    return serverError(res, error);
  }
};

// =======================================
// List disputes visible to the current user
// GET /api/disputes?status=&priority=&search=&page=&limit=
// =======================================

export const getMyDisputes = async (req, res) => {
  try {
    const { status, priority, search } = req.query;

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));

    const filter = { ...scopeFilter(req.user) };
    const and = [];

    if (status && DISPUTE_STATUSES.includes(status)) {
      filter.status = status;
    } else if (status === "active") {
      filter.status = { $nin: CLOSED_STATUSES };
    }

    if (priority && PRIORITIES.includes(priority)) {
      filter.priority = priority;
    }

    if (search && typeof search === "string" && search.trim()) {
      const safe = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(safe, "i");

      and.push({
        $or: [
          { disputeId: regex },
          { transactionId: regex },
          { orderId: regex },
          { issueType: regex },
        ],
      });
    }

    if (and.length) filter.$and = and;

    const [disputes, total] = await Promise.all([
      Dispute.find(filter)
        .select("-timeline -comments")
        .populate("customer", "fullName email")
        .populate("merchant", "organizationName")
        .populate("assignedEmployee", "fullName")
        .sort({ updatedAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Dispute.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      disputes,
      total,
      page,
      pages: Math.max(1, Math.ceil(total / limit)),
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// Kept for older frontend calls — same role-scoped list
export const getOrganizationDisputes = getMyDisputes;
export const getAllDisputes = getMyDisputes;

// =======================================
// Get Single Dispute
// =======================================

export const getDisputeById = async (req, res) => {
  try {
    const dispute = await loadAuthorizedDispute(req, res);
    if (!dispute) return;

    const populated = await populateDispute(Dispute.findById(dispute._id));

    res.status(200).json({
      success: true,
      dispute: populated,
      permissions: {
        canManage: canManageDispute(req.user, dispute),
        canAssign: canAssignDispute(req.user, dispute),
        canDelete:
          req.user.role === "Admin" ||
          (req.user.role === "Customer" &&
            dispute.status === "Open" &&
            !dispute.assignedEmployee),
        canAddEvidence: !CLOSED_STATUSES.includes(dispute.status),
      },
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// =======================================
// Update Status
// =======================================

export const updateDisputeStatus = async (req, res) => {
  try {
    const dispute = await loadAuthorizedDispute(req, res);
    if (!dispute) return;

    if (!canManageDispute(req.user, dispute)) {
      return fail(res, 403, "You cannot update this dispute.");
    }

    const { status, stage, remarks } = req.body;

    if (!DISPUTE_STATUSES.includes(status)) {
      return fail(res, 400, "Select a valid status.");
    }

    if (stage && !DISPUTE_STAGES.includes(stage)) {
      return fail(res, 400, "Select a valid stage.");
    }

    if (
      CLOSED_STATUSES.includes(dispute.status) &&
      req.user.role !== "Admin"
    ) {
      return fail(
        res,
        400,
        "This dispute is closed. Only an administrator can reopen it."
      );
    }

    if (CLOSED_STATUSES.includes(status) && !remarks?.trim()) {
      return fail(
        res,
        400,
        "Please add remarks explaining the resolution or rejection."
      );
    }

    const previous = dispute.status;

    dispute.status = status;

    if (status === "Resolved" || status === "Rejected") {
      dispute.currentStage = status;
      dispute.resolvedAt = status === "Resolved" ? new Date() : undefined;
      dispute.closedAt = new Date();
    } else {
      dispute.closedAt = undefined;
      dispute.resolvedAt = undefined;
      if (stage) dispute.currentStage = stage;
      else if (CLOSED_STATUSES.includes(dispute.currentStage))
        dispute.currentStage = "Merchant Review";
    }

    dispute.timeline.push(
      timelineEntry(req.user, `Status changed from ${previous} to ${status}`, {
        stage: dispute.currentStage,
        remarks: remarks?.trim() || "",
      })
    );

    await dispute.save();

    await notifyUsers(
      [dispute.customer, dispute.assignedEmployee],
      {
        title: "Dispute status updated",
        message: `Dispute ${dispute.disputeId} is now "${status}".${
          remarks?.trim() ? ` Remarks: ${remarks.trim()}` : ""
        }`,
        dispute: dispute._id,
      },
      { exclude: req.user._id }
    );

    res.status(200).json({
      success: true,
      message: "Status updated successfully.",
      dispute,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// =======================================
// Add Timeline Entry (internal update)
// =======================================

export const addTimelineEntry = async (req, res) => {
  try {
    const dispute = await loadAuthorizedDispute(req, res);
    if (!dispute) return;

    if (!canManageDispute(req.user, dispute)) {
      return fail(res, 403, "You cannot update this dispute.");
    }

    const { action, remarks } = req.body;

    if (!action?.trim()) {
      return fail(res, 400, "Action is required.");
    }

    dispute.timeline.push(
      timelineEntry(req.user, action.trim().slice(0, 200), {
        stage: dispute.currentStage,
        remarks: remarks?.trim()?.slice(0, 1000) || "",
      })
    );

    await dispute.save();

    await notifyUsers(
      [dispute.customer],
      {
        title: "New update on your dispute",
        message: `${dispute.disputeId}: ${action.trim().slice(0, 200)}`,
        dispute: dispute._id,
      },
      { exclude: req.user._id }
    );

    res.status(200).json({
      success: true,
      dispute,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// =======================================
// Add Comment (any participant)
// =======================================

export const addComment = async (req, res) => {
  try {
    const dispute = await loadAuthorizedDispute(req, res);
    if (!dispute) return;

    const comment = req.body.comment?.trim();

    if (!comment) {
      return fail(res, 400, "Comment cannot be empty.");
    }

    if (comment.length > 2000) {
      return fail(res, 400, "Comment must be under 2000 characters.");
    }

    dispute.comments.push({
      user: req.user._id,
      userName: req.user.fullName,
      userRole: req.user.role,
      organization: req.user.organization?._id || null,
      comment,
    });

    await dispute.save();

    // Customer comments go to the people handling the case;
    // staff comments go to the customer (and the assignee).
    let receivers;

    if (req.user.role === "Customer") {
      receivers = dispute.assignedEmployee
        ? [dispute.assignedEmployee]
        : await getOrgAdmins(involvedOrgIds(dispute));
    } else {
      receivers = [dispute.customer, dispute.assignedEmployee];
    }

    await notifyUsers(
      receivers,
      {
        title: "New comment",
        type: "Comment",
        message: `${req.user.fullName} commented on ${dispute.disputeId}: "${comment.slice(0, 120)}"`,
        dispute: dispute._id,
      },
      { exclude: req.user._id }
    );

    res.status(201).json({
      success: true,
      comments: dispute.comments,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// =======================================
// Add Evidence to an existing dispute
// =======================================

export const addEvidence = async (req, res) => {
  try {
    const dispute = await loadAuthorizedDispute(req, res);

    if (!dispute) {
      removeLocalFiles(req.files);
      return;
    }

    if (CLOSED_STATUSES.includes(dispute.status)) {
      removeLocalFiles(req.files);
      return fail(res, 400, "Evidence cannot be added to a closed dispute.");
    }

    if (!req.files?.length) {
      return fail(res, 400, "Select at least one file.");
    }

    if (dispute.evidence.length + req.files.length > 10) {
      removeLocalFiles(req.files);
      return fail(res, 400, "A dispute can have at most 10 evidence files.");
    }

    dispute.evidence.push(...filesToEvidence(req.files, req.user._id));

    dispute.timeline.push(
      timelineEntry(
        req.user,
        `${req.files.length} evidence file(s) uploaded`,
        { stage: dispute.currentStage }
      )
    );

    await dispute.save();

    res.status(201).json({
      success: true,
      evidence: dispute.evidence,
    });
  } catch (error) {
    removeLocalFiles(req.files);
    return serverError(res, error);
  }
};

// =======================================
// Download Evidence (authorized)
// =======================================

export const downloadEvidence = async (req, res) => {
  try {
    const dispute = await loadAuthorizedDispute(req, res);
    if (!dispute) return;

    const file = dispute.evidence.id(req.params.evidenceId);

    if (!file) {
      return fail(res, 404, "File not found.");
    }

    if (file.storage === "cloudinary") {
      return res.status(200).json({ success: true, url: file.fileUrl });
    }

    // storedName is generated by the server; basename guards against traversal
    const filePath = path.join(UPLOAD_DIR, path.basename(file.storedName || ""));

    if (!file.storedName || !fs.existsSync(filePath)) {
      return fail(res, 404, "File not found.");
    }

    res.setHeader("Content-Type", file.mimeType || "application/octet-stream");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(file.fileName || "evidence")}"`
    );

    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    return serverError(res, error);
  }
};

// =======================================
// Delete Dispute
// Customer: own dispute, still Open and unassigned
// Admin: any dispute
// =======================================

export const deleteDispute = async (req, res) => {
  try {
    const dispute = await loadAuthorizedDispute(req, res);
    if (!dispute) return;

    const customerCanDelete =
      req.user.role === "Customer" &&
      dispute.status === "Open" &&
      !dispute.assignedEmployee;

    if (req.user.role !== "Admin" && !customerCanDelete) {
      return fail(
        res,
        403,
        "This dispute can no longer be withdrawn because it is already being processed."
      );
    }

    dispute.evidence
      .filter((file) => file.storage === "local" && file.storedName)
      .forEach((file) =>
        fs.unlink(path.join(UPLOAD_DIR, path.basename(file.storedName)), () => {})
      );

    await dispute.deleteOne();

    res.status(200).json({
      success: true,
      message: "Dispute deleted successfully.",
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// =======================================
// Assign Dispute to an Employee
// =======================================

export const assignDispute = async (req, res) => {
  try {
    const dispute = await loadAuthorizedDispute(req, res);
    if (!dispute) return;

    if (!canAssignDispute(req.user, dispute)) {
      return fail(res, 403, "You cannot assign this dispute.");
    }

    if (CLOSED_STATUSES.includes(dispute.status)) {
      return fail(res, 400, "Closed disputes cannot be reassigned.");
    }

    const { employeeId } = req.body;

    if (!isValidId(employeeId)) {
      return fail(res, 400, "Select a valid employee.");
    }

    const employee = await User.findOne({
      _id: employeeId,
      role: { $in: ["Employee", "OrganizationAdmin"] },
      accountStatus: "Active",
    });

    if (!employee || !employee.organization) {
      return fail(res, 400, "Select a valid employee.");
    }

    const employeeOrg = employee.organization.toString();

    // Employee must belong to one of the organizations in this dispute,
    // and an organization admin can only assign within their own organization.
    if (!involvedOrgIds(dispute).includes(employeeOrg)) {
      return fail(
        res,
        400,
        "This employee's organization is not part of the dispute."
      );
    }

    if (
      req.user.role === "OrganizationAdmin" &&
      employeeOrg !== userOrgId(req.user)
    ) {
      return fail(res, 403, "You can only assign employees from your organization.");
    }

    const org = await Organization.findById(employeeOrg);

    const stageByType = {
      Merchant: "Merchant Review",
      "E-commerce Platform": "Merchant Review",
      Bank: "Bank Verification",
      "Payment Gateway": "Gateway Verification",
    };

    dispute.assignedEmployee = employee._id;
    dispute.assignedOrganization = employee.organization;
    dispute.currentStage = stageByType[org?.organizationType] || dispute.currentStage;

    if (dispute.status === "Open") dispute.status = "In Progress";

    dispute.timeline.push(
      timelineEntry(
        req.user,
        `Assigned to ${employee.fullName}${org ? ` (${org.organizationName})` : ""}`,
        { stage: dispute.currentStage }
      )
    );

    await dispute.save();

    await notifyUsers(
      [employee._id],
      {
        title: "New dispute assigned",
        type: "Assignment",
        message: `You have been assigned dispute ${dispute.disputeId}.`,
        dispute: dispute._id,
      },
      { exclude: req.user._id }
    );

    await notifyUsers([dispute.customer], {
      title: "Your dispute is being handled",
      message: `Dispute ${dispute.disputeId} has been assigned to ${org?.organizationName || "an agent"} for review.`,
      dispute: dispute._id,
    });

    res.status(200).json({
      success: true,
      message: "Dispute assigned successfully.",
      dispute,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// =======================================
// Employees who can be assigned to a dispute
// =======================================

export const getAssignableEmployees = async (req, res) => {
  try {
    const dispute = await loadAuthorizedDispute(req, res);
    if (!dispute) return;

    if (!canAssignDispute(req.user, dispute)) {
      return fail(res, 403, "You cannot assign this dispute.");
    }

    const orgs =
      req.user.role === "Admin"
        ? involvedOrgIds(dispute)
        : [userOrgId(req.user)];

    const employees = await User.find({
      organization: { $in: orgs },
      role: { $in: ["Employee", "OrganizationAdmin"] },
      accountStatus: "Active",
    })
      .select("fullName email role organization")
      .populate("organization", "organizationName organizationType")
      .sort({ fullName: 1 });

    res.status(200).json({ success: true, employees });
  } catch (error) {
    return serverError(res, error);
  }
};

// =======================================
// Dashboard Summary (role-scoped)
// =======================================

export const getDashboardSummary = async (req, res) => {
  try {
    const filter = scopeFilter(req.user);
    const now = new Date();

    const [
      total,
      open,
      inProgress,
      resolved,
      rejected,
      highPriority,
      overdue,
      unassigned,
      recentDisputes,
    ] = await Promise.all([
      Dispute.countDocuments(filter),
      Dispute.countDocuments({ ...filter, status: "Open" }),
      Dispute.countDocuments({
        ...filter,
        status: { $nin: [...CLOSED_STATUSES, "Open"] },
      }),
      Dispute.countDocuments({ ...filter, status: "Resolved" }),
      Dispute.countDocuments({ ...filter, status: "Rejected" }),
      Dispute.countDocuments({
        ...filter,
        priority: { $in: ["High", "Critical"] },
        status: { $nin: CLOSED_STATUSES },
      }),
      Dispute.countDocuments({
        ...filter,
        status: { $nin: CLOSED_STATUSES },
        slaDeadline: { $lt: now },
      }),
      Dispute.countDocuments({
        ...filter,
        assignedEmployee: null,
        status: { $nin: CLOSED_STATUSES },
      }),
      Dispute.find(filter)
        .select("disputeId transactionId amount status priority issueType updatedAt createdAt slaDeadline")
        .populate("merchant", "organizationName")
        .populate("customer", "fullName")
        .sort({ updatedAt: -1 })
        .limit(6),
    ]);

    const summary = {
      total,
      open,
      inProgress,
      resolved,
      rejected,
      highPriority,
      overdue,
      unassigned,
    };

    if (req.user.role === "Admin") {
      const [users, organizations] = await Promise.all([
        User.countDocuments(),
        Organization.countDocuments(),
      ]);

      summary.users = users;
      summary.organizations = organizations;
    }

    res.status(200).json({
      success: true,
      summary,
      recentDisputes,
    });
  } catch (error) {
    return serverError(res, error);
  }
};
