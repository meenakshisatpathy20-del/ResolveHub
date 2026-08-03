import Dispute from "../models/Dispute.js";

// ===============================
// Create Dispute
// ===============================

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

    return res.status(201).json({
      success: true,
      message: "Dispute created successfully.",
      dispute,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ===============================
// Get Logged In User Disputes
// ===============================

export const getMyDisputes = async (
  req,
  res
) => {
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

// ===============================
// Get Single Dispute
// ===============================

export const getDisputeById = async (
  req,
  res
) => {
  try {
    const dispute = await Dispute.findById(
      req.params.id
    );

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

// ===============================
// Update Status
// ===============================

export const updateDisputeStatus =
  async (req, res) => {
    try {
      const { status } = req.body;

      const dispute =
        await Dispute.findById(req.params.id);

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

// ===============================
// Add Comment
// ===============================

export const addTimelineEntry =
  async (req, res) => {
    try {
      const { action } = req.body;

      const dispute =
        await Dispute.findById(req.params.id);

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

// ===============================
// Delete Dispute
// ===============================

export const deleteDispute =
  async (req, res) => {
    try {
      const dispute =
        await Dispute.findById(req.params.id);

      if (!dispute) {
        return res.status(404).json({
          success: false,
          message: "Dispute not found.",
        });
      }

      await dispute.deleteOne();

      res.status(200).json({
        success: true,
        message: "Dispute deleted.",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };

// ===============================
// Dashboard Summary
// ===============================

export const getDashboardSummary =
  async (req, res) => {
    try {
      const total =
        await Dispute.countDocuments({
          customer: req.user._id,
        });

      const open =
        await Dispute.countDocuments({
          customer: req.user._id,
          status: "Open",
        });

      const resolved =
        await Dispute.countDocuments({
          customer: req.user._id,
          status: "Resolved",
        });

      const highPriority =
        await Dispute.countDocuments({
          customer: req.user._id,
          priority: "High",
        });

      res.status(200).json({
        success: true,
        summary: {
          total,
          open,
          resolved,
          highPriority,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  };