import Notification from "../models/Notification.js";
import User from "../models/User.js";

// =======================================
// Create notifications for many receivers
// =======================================
//
// Duplicates and the user who triggered the event are skipped.
// Failures are logged, never thrown: a notification problem must
// not break the dispute action that caused it.

export const notifyUsers = async (
  receivers,
  { title, message, type = "Dispute", dispute = null },
  { exclude } = {}
) => {
  try {
    const excludeId = exclude ? exclude.toString() : null;

    const unique = [
      ...new Set(
        receivers
          .filter(Boolean)
          .map((r) => (r._id || r).toString())
      ),
    ].filter((id) => id !== excludeId);

    if (!unique.length) return;

    await Notification.insertMany(
      unique.map((receiver) => ({
        receiver,
        title,
        message,
        type,
        dispute,
      }))
    );
  } catch (error) {
    console.error("Notification failed:", error.message);
  }
};

// Active organization admins of the given organizations
export const getOrgAdmins = async (orgIds) => {
  const ids = orgIds.filter(Boolean);

  if (!ids.length) return [];

  return User.find({
    organization: { $in: ids },
    role: "OrganizationAdmin",
    accountStatus: "Active",
  }).select("_id");
};
