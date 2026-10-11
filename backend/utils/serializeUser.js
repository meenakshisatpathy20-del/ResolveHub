// Shape of the user object sent to the frontend.
// Never includes the password hash.

const serializeUser = (user) => {
  const org = user.organization;

  return {
    _id: user._id,
    id: user._id,
    fullName: user.fullName,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    employeeRole: user.employeeRole,
    organization:
      org && org.organizationName
        ? {
            _id: org._id,
            organizationName: org.organizationName,
            organizationType: org.organizationType,
          }
        : org || null,
    profileImage: user.profileImage,
    emailVerified: user.emailVerified,
    accountStatus: user.accountStatus,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt,
  };
};

export default serializeUser;
