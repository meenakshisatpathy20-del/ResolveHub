import Dispute, { CLOSED_STATUSES } from "../models/Dispute.js";
import { scopeFilter } from "../utils/disputeAccess.js";

const serverError = (res, error) => {
  console.error(error);
  return res.status(500).json({
    success: false,
    message: "Unable to generate the report.",
  });
};

// Optional ?from=YYYY-MM-DD&to=YYYY-MM-DD filter on createdAt
const dateFilter = (query) => {
  const range = {};

  if (query.from && !isNaN(Date.parse(query.from))) {
    range.$gte = new Date(query.from);
  }

  if (query.to && !isNaN(Date.parse(query.to))) {
    const to = new Date(query.to);
    to.setHours(23, 59, 59, 999);
    range.$lte = to;
  }

  return Object.keys(range).length ? { createdAt: range } : {};
};

// =======================================
// Report Summary (role-scoped)
// =======================================

export const getReportSummary = async (req, res) => {
  try {
    const match = { ...scopeFilter(req.user), ...dateFilter(req.query) };

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    const [byStatus, byIssue, byPriority, monthly, totals, resolution] =
      await Promise.all([
        Dispute.aggregate([
          { $match: match },
          { $group: { _id: "$status", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ]),
        Dispute.aggregate([
          { $match: match },
          {
            $group: {
              _id: "$issueType",
              count: { $sum: 1 },
              amount: { $sum: "$amount" },
            },
          },
          { $sort: { count: -1 } },
        ]),
        Dispute.aggregate([
          { $match: match },
          { $group: { _id: "$priority", count: { $sum: 1 } } },
        ]),
        Dispute.aggregate([
          {
            $match: {
              ...match,
              createdAt: {
                ...(match.createdAt || {}),
                $gte: match.createdAt?.$gte > sixMonthsAgo
                  ? match.createdAt.$gte
                  : sixMonthsAgo,
              },
            },
          },
          {
            $group: {
              _id: {
                year: { $year: "$createdAt" },
                month: { $month: "$createdAt" },
              },
              raised: { $sum: 1 },
              resolved: {
                $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
              },
              amount: { $sum: "$amount" },
            },
          },
          { $sort: { "_id.year": 1, "_id.month": 1 } },
        ]),
        Dispute.aggregate([
          { $match: match },
          {
            $group: {
              _id: null,
              total: { $sum: 1 },
              amount: { $sum: "$amount" },
              resolvedAmount: {
                $sum: {
                  $cond: [{ $eq: ["$status", "Resolved"] }, "$amount", 0],
                },
              },
              closed: {
                $sum: {
                  $cond: [{ $in: ["$status", CLOSED_STATUSES] }, 1, 0],
                },
              },
              resolved: {
                $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
              },
            },
          },
        ]),
        Dispute.aggregate([
          { $match: { ...match, status: "Resolved", resolvedAt: { $ne: null } } },
          {
            $group: {
              _id: null,
              avgMs: { $avg: { $subtract: ["$resolvedAt", "$createdAt"] } },
            },
          },
        ]),
      ]);

    // Fill in empty months so the chart has a continuous axis
    const months = [];
    const cursor = new Date(sixMonthsAgo);

    for (let i = 0; i < 6; i++) {
      const year = cursor.getFullYear();
      const month = cursor.getMonth() + 1;
      const row = monthly.find(
        (m) => m._id.year === year && m._id.month === month
      );

      months.push({
        label: cursor.toLocaleString("en-IN", { month: "short", year: "2-digit" }),
        raised: row?.raised || 0,
        resolved: row?.resolved || 0,
        amount: row?.amount || 0,
      });

      cursor.setMonth(cursor.getMonth() + 1);
    }

    const t = totals[0] || {
      total: 0,
      amount: 0,
      resolvedAmount: 0,
      closed: 0,
      resolved: 0,
    };

    res.status(200).json({
      success: true,
      totals: {
        total: t.total,
        amount: t.amount,
        resolvedAmount: t.resolvedAmount,
        resolutionRate: t.closed ? Math.round((t.resolved / t.closed) * 100) : 0,
        avgResolutionDays: resolution[0]
          ? Math.round((resolution[0].avgMs / 86400000) * 10) / 10
          : null,
      },
      byStatus: byStatus.map((r) => ({ name: r._id, value: r.count })),
      byIssue: byIssue.map((r) => ({ name: r._id, value: r.count, amount: r.amount })),
      byPriority: byPriority.map((r) => ({ name: r._id, value: r.count })),
      monthly: months,
    });
  } catch (error) {
    return serverError(res, error);
  }
};

// =======================================
// CSV Export (role-scoped)
// =======================================

const csvCell = (value) => {
  if (value === null || value === undefined) return "";

  let text = String(value);

  // Prevent spreadsheet formula injection
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;

  return `"${text.replace(/"/g, '""')}"`;
};

export const exportDisputesCsv = async (req, res) => {
  try {
    const match = { ...scopeFilter(req.user), ...dateFilter(req.query) };

    const disputes = await Dispute.find(match)
      .populate("customer", "fullName email")
      .populate("merchant", "organizationName")
      .populate("bank", "organizationName")
      .populate("paymentGateway", "organizationName")
      .populate("assignedEmployee", "fullName")
      .sort({ createdAt: -1 })
      .limit(5000)
      .lean();

    const header = [
      "Dispute ID",
      "Transaction ID",
      "Order ID",
      "Amount (INR)",
      "Issue Type",
      "Priority",
      "Status",
      "Stage",
      "Customer",
      "Customer Email",
      "Merchant",
      "Bank",
      "Payment Gateway",
      "Assigned To",
      "Raised On",
      "SLA Deadline",
      "Resolved On",
    ];

    const fmt = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");

    const rows = disputes.map((d) =>
      [
        d.disputeId,
        d.transactionId,
        d.orderId,
        d.amount,
        d.issueType,
        d.priority,
        d.status,
        d.currentStage,
        d.customer?.fullName,
        d.customer?.email,
        d.merchant?.organizationName,
        d.bank?.organizationName,
        d.paymentGateway?.organizationName,
        d.assignedEmployee?.fullName,
        fmt(d.createdAt),
        fmt(d.slaDeadline),
        fmt(d.resolvedAt),
      ]
        .map(csvCell)
        .join(",")
    );

    const csv = "﻿" + [header.map(csvCell).join(","), ...rows].join("\r\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="resolvehub-disputes-${fmt(new Date())}.csv"`
    );

    res.status(200).send(csv);
  } catch (error) {
    return serverError(res, error);
  }
};
