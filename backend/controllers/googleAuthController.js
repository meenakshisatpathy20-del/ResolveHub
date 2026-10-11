import crypto from "crypto";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";

import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import serializeUser from "../utils/serializeUser.js";

export const googleLogin = async (req, res) => {
  try {
    const clientId = process.env.GOOGLE_CLIENT_ID;

    if (!clientId) {
      return res.status(503).json({
        success: false,
        message: "Google sign-in is not configured.",
      });
    }

    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Missing Google credential.",
      });
    }

    const client = new OAuth2Client(clientId);

    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId,
    });

    const { email, name, picture, email_verified } = ticket.getPayload();

    if (!email || !email_verified) {
      return res.status(401).json({
        success: false,
        message: "Your Google email is not verified.",
      });
    }

    let user = await User.findOne({ email: email.toLowerCase() }).populate(
      "organization"
    );

    if (!user) {
      // Random unusable password: Google users sign in with Google,
      // or set a password through "Forgot password".
      user = await User.create({
        fullName: name || email.split("@")[0],
        email: email.toLowerCase(),
        password: await bcrypt.hash(crypto.randomBytes(32).toString("hex"), 10),
        role: "Customer",
        profileImage: picture || "",
        emailVerified: true,
      });
    }

    if (user.accountStatus !== "Active") {
      return res.status(403).json({
        success: false,
        message: "Your account is not active. Please contact support.",
      });
    }

    user.lastLogin = new Date();
    if (!user.profileImage && picture) user.profileImage = picture;
    await user.save();

    res.status(200).json({
      success: true,
      token: generateToken(user._id),
      user: serializeUser(user),
    });
  } catch (error) {
    console.error(error);

    res.status(401).json({
      success: false,
      message: "Google sign-in failed. Please try again.",
    });
  }
};
