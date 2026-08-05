import Organization from "../models/Organization.js";
import User from "../models/User.js";

// ================================
// Create Organization
// ================================

export const createOrganization = async (
  req,
  res
) => {
  try {
    const organization =
      await Organization.create(req.body);

    res.status(201).json({
      success: true,
      organization,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// Get All Organizations
// ================================

export const getOrganizations = async (
  req,
  res
) => {
  try {
    const organizations =
      await Organization.find().sort({
        organizationName: 1,
      });

    res.status(200).json({
      success: true,
      organizations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================================
// Get Single Organization
// ================================

export const getOrganizationById =
  async (req, res) => {
    try {
      const organization =
        await Organization.findById(
          req.params.id
        ).populate(
          "employees",
          "-password"
        );

      if (!organization) {
        return res.status(404).json({
          success: false,
          message:
            "Organization not found.",
        });
      }

      res.status(200).json({
        success: true,
        organization,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// ================================
// Assign Employee
// ================================

export const assignEmployee =
  async (req, res) => {
    try {
      const organization =
        await Organization.findById(
          req.params.id
        );

      const employee =
        await User.findById(req.body.employeeId);

      if (!organization || !employee) {
        return res.status(404).json({
          success: false,
          message:
            "Organization or Employee not found.",
        });
      }

      if (
        !organization.employees.includes(
          employee._id
        )
      ) {
        organization.employees.push(
          employee._id
        );

        await organization.save();
      }

      res.status(200).json({
        success: true,
        organization,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// ================================
// Delete Organization
// ================================

export const deleteOrganization =
  async (req, res) => {
    try {
      const organization =
        await Organization.findById(
          req.params.id
        );

      if (!organization) {
        return res.status(404).json({
          success: false,
          message:
            "Organization not found.",
        });
      }

      await organization.deleteOne();

      res.status(200).json({
        success: true,
        message:
          "Organization deleted successfully.",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };