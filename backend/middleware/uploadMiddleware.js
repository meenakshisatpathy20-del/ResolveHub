import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,

  params: async (req, file) => ({
    folder: "ResolveHub",

    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "pdf",
    ],

    public_id:
      Date.now() +
      "-" +
      file.originalname.replace(/\s+/g, "-"),
  }),
});

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

export default upload;