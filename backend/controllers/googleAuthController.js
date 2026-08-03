import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

const client = new OAuth2Client(
  "956678710472-6begml2lcus6j908i3f9l7ffih0qlidr.apps.googleusercontent.com"
);

export const googleLogin = async (
  req,
  res
) => {
  try {
    const { credential } = req.body;

    const ticket =
      await client.verifyIdToken({
        idToken: credential,
        audience:
          "956678710472-6begml2lcus6j908i3f9l7ffih0qlidr.apps.googleusercontent.com",
      });

    const payload = ticket.getPayload();

    const {
      email,
      name,
      picture,
    } = payload;

    let user = await User.findOne({
      email,
    });

    if (!user) {
      user = await User.create({
        fullName: name,

        email,

        password: "GOOGLE_AUTH",

        organizationName: "Individual",

        organizationType:
          "Customer",

        profileImage: picture,

        emailVerified: true,
      });
    }

    const token = generateToken(
      user._id
    );

    res.status(200).json({
      success: true,

      token,

      user,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};