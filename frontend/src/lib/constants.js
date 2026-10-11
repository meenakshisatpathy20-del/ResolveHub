// Keep in sync with backend/models/Dispute.js

export const DISPUTE_STATUSES = [
  "Open",
  "In Progress",
  "Awaiting Customer",
  "Awaiting Merchant",
  "Awaiting Bank",
  "Awaiting Gateway",
  "Resolved",
  "Rejected",
];

export const DISPUTE_STAGES = [
  "Customer Submitted",
  "Merchant Review",
  "Bank Verification",
  "Gateway Verification",
  "Resolved",
  "Rejected",
];

export const ISSUE_TYPES = [
  "Payment Failed",
  "Duplicate Payment",
  "Refund Pending",
  "Unauthorized Transaction",
  "Chargeback",
  "Wrong Amount",
  "Merchant Issue",
  "Bank Issue",
  "Gateway Issue",
  "Other",
];

export const PRIORITIES = ["Low", "Medium", "High", "Critical"];

export const ORGANIZATION_TYPES = [
  "Bank",
  "Merchant",
  "Payment Gateway",
  "E-commerce Platform",
  "Logistics Partner",
];

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_FILE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
];

// Fired after notifications change so the unread badge refreshes
export const NOTIFICATIONS_CHANGED = "notifications:changed";
