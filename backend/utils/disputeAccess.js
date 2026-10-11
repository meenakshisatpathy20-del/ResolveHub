// =======================================
// Role-based access rules for disputes
// =======================================
//
// Customer          → only their own disputes
// Employee          → disputes assigned to them
// OrganizationAdmin → disputes where their organization is the
//                     merchant, bank or payment gateway
// Admin             → everything

const idOf = (value) => {
  if (!value) return null;
  return (value._id || value).toString();
};

export const userOrgId = (user) => idOf(user.organization);

export const involvedOrgIds = (dispute) =>
  [dispute.merchant, dispute.bank, dispute.paymentGateway]
    .map(idOf)
    .filter(Boolean);

// Mongo filter for the disputes a user is allowed to see
export const scopeFilter = (user) => {
  switch (user.role) {
    case "Admin":
      return {};

    case "OrganizationAdmin": {
      const org = user.organization?._id || user.organization;

      if (!org) return { _id: null };

      return {
        $or: [
          { merchant: org },
          { bank: org },
          { paymentGateway: org },
        ],
      };
    }

    case "Employee":
      return { assignedEmployee: user._id };

    default:
      return { customer: user._id };
  }
};

export const canViewDispute = (user, dispute) => {
  const userId = user._id.toString();

  switch (user.role) {
    case "Admin":
      return true;

    case "OrganizationAdmin":
      return involvedOrgIds(dispute).includes(userOrgId(user));

    case "Employee":
      return idOf(dispute.assignedEmployee) === userId;

    default:
      return idOf(dispute.customer) === userId;
  }
};

// Who may change status / add internal timeline entries
export const canManageDispute = (user, dispute) => {
  if (user.role === "Customer") return false;

  return canViewDispute(user, dispute);
};

// Who may assign an employee
export const canAssignDispute = (user, dispute) => {
  if (user.role === "Admin") return true;

  return (
    user.role === "OrganizationAdmin" &&
    involvedOrgIds(dispute).includes(userOrgId(user))
  );
};
