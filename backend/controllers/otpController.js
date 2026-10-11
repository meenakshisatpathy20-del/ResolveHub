import OTP from "../models/OTP.js";
import User from "../models/User.js";
import generateOTP from "../utils/generateOTP.js";
import sendEmail from "../utils/sendEmail.js";

const OTP_EXPIRY =
  Number(process.env.OTP_EXPIRY_MINUTES || 5) * 60 * 1000;

// ======================
// Send Email OTP
// ======================
export const sendEmailOTP = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (await User.exists({ email })) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists. Please log in.",
      });
    }

    // Delete previous OTPs
    await OTP.deleteMany({
      email,
      purpose: "EMAIL_VERIFICATION",
    });

    const otp = generateOTP();

    await OTP.create({
      email,
      otp,
      purpose: "EMAIL_VERIFICATION",
      expiresAt: new Date(Date.now() + OTP_EXPIRY),
    });

    const html = `
        <div style="font-family:Arial,sans-serif;padding:20px">
            <h2 style="color:#2563eb;">Welcome to ResolveHub</h2>

            <p>Your email verification OTP is:</p>

            <h1 style="letter-spacing:5px;">
                ${otp}
            </h1>

            <p>
                This OTP is valid for
                <strong>${process.env.OTP_EXPIRY_MINUTES || 5} minutes</strong>.
            </p>

            <hr>

            <p style="color:gray;font-size:13px;">
                If you didn't request this OTP,
                please ignore this email.
            </p>
        </div>
    `;

    await sendEmail(
      email,
      "ResolveHub Email Verification",
      html
    );

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Unable to send OTP.",
    });
  }
};

// ======================
// Verify Email OTP
// ======================
export const verifyEmailOTP = async (req, res) => {
  try {
    const email = req.body.email?.toLowerCase().trim();
    const otp = req.body.otp?.toString().trim();

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const record = await OTP.findOne({
      email,
      otp,
      purpose: "EMAIL_VERIFICATION",
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP.",
      });
    }

    if (record.expiresAt < new Date()) {
      await OTP.deleteOne({
        _id: record._id,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired.",
      });
    }

    record.verified = true;
    await record.save();

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "OTP verification failed.",
    });
  }
};