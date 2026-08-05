import Dispute from "../models/Dispute.js";
import Notification from "../models/Notification.js";

// =======================================
// Create Dispute
// =======================================

export const createDispute = async (req, res) => {
  try {
    const dispute = await Dispute.create({
      ...req.body,
      customer: req.user._id,
      timeline: [
        {
          action: "Dispute Raised",
          performedBy: req.user.fullName,
        },
      ],
    });

    // Create Notification
    await Notification.create({
      receiver: req.user._id,
      title: "Dispute Created",
      message: `Your dispute ${dispute.disputeId} has been created successfully.`,
      dispute: dispute._id,
    });

    res.status(201).json({
      success: true,
      message: "Dispute created successfully.",
      dispute,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Get My Disputes
// =======================================

export const getMyDisputes = async (req, res) => {
  try {
    const disputes = await Dispute.find({
      customer: req.user._id,
    }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      disputes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Get Single Dispute
// =======================================

export const getDisputeById = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id)
      .populate("customer", "-password")
      .populate("assignedTo", "-password");

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute not found.",
      });
    }

    res.status(200).json({
      success: true,
      dispute,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Update Status
// =======================================

export const updateDisputeStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute not found.",
      });
    }

    dispute.status = status;

    dispute.timeline.push({
      action: `Status changed to ${status}`,
      performedBy: req.user.fullName,
    });

    await dispute.save();

    // Notify Customer
    await Notification.create({
      receiver: dispute.customer,
      title: "Dispute Status Updated",
      message: `Your dispute ${dispute.disputeId} is now ${status}.`,
      dispute: dispute._id,
    });

    res.status(200).json({
      success: true,
      message: "Status updated successfully.",
      dispute,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Add Timeline Entry
// =======================================

export const addTimelineEntry = async (req, res) => {
  try {
    const { action } = req.body;

    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute not found.",
      });
    }

    dispute.timeline.push({
      action,
      performedBy: req.user.fullName,
    });

    await dispute.save();

    res.status(200).json({
      success: true,
      dispute,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Delete Dispute
// =======================================

export const deleteDispute = async (req, res) => {
  try {
    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute not found.",
      });
    }

    await dispute.deleteOne();

    res.status(200).json({
      success: true,
      message: "Dispute deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// =======================================
// Dashboard Summary
// =======================================

export const getDashboardSummary = async (req, res) => {
  try {
    const filter =
      req.user.organizationType === "Customer"
        ? { customer: req.user._id }
        : { assignedTo: req.user._id };

    const [
      total,
      open,
      resolved,
      highPriority,
      recentDisputes,
    ] = await Promise.all([
      Dispute.countDocuments(filter),

      Dispute.countDocuments({
        ...filter,
        status: "Open",
      }),

      Dispute.countDocuments({
        ...filter,
        status: "Resolved",
      }),

      Dispute.countDocuments({
        ...filter,
        priority: "High",
      }),

      Dispute.find(filter)
        .sort({ updatedAt: -1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      summary: {
        total,
        open,
        resolved,
        highPriority,
      },
      recentDisputes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// =======================================
// Assign Dispute
// =======================================

export const assignDispute = async (req, res) => {
  try {
    const { employeeId } = req.body;

    const dispute = await Dispute.findById(req.params.id);

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: "Dispute not found.",
      });
    }

    dispute.assignedTo = employeeId;

    dispute.timeline.push({
      action: "Dispute Assigned",
      performedBy: req.user.fullName,
    });

    await dispute.save();

    await Notification.create({
      receiver: employeeId,
      title: "New Dispute Assigned",
      message: `You have been assigned dispute ${dispute.disputeId}.`,
      dispute: dispute._id,
    });

    res.status(200).json({
      success: true,
      message: "Dispute assigned successfully.",
      dispute,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// =======================================
// Organization Disputes
// =======================================

export const getOrganizationDisputes = async (
  req,
  res
) => {
  try {
    const disputes = await Dispute.find({
      assignedTo: req.user._id,
    })
      .populate(
        "customer",
        "fullName email organizationName"
      )
      .sort({
        updatedAt: -1,
      });

    res.status(200).json({
      success: true,
      count: disputes.length,
      disputes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// =======================================
// Get All Disputes
// =======================================

export const getAllDisputes = async (
  req,
  res
) => {
  try {
    const disputes = await Dispute.find()
      .populate(
        "customer",
        "fullName email organizationName organizationType"
      )
      .populate(
        "assignedTo",
        "fullName email organizationName"
      )
      .sort({
        updatedAt: -1,
      });

    res.status(200).json({
      success: true,
      count: disputes.length,
      disputes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};