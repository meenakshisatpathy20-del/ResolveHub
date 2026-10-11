import fs from "fs";
import path from "path";
import crypto from "crypto";
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";

import cloudinary, {
  isCloudinaryConfigured,
} from "../config/cloudinary.js";

// =======================================
// Evidence upload
// =======================================
//
// Uses Cloudinary when CLOUDINARY_* variables are set,
// otherwise stores files on disk in backend/uploads.
// Local files are never served statically: they are only
// reachable through the authorized evidence download route.

export const UPLOAD_DIR = path.resolve("uploads");

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "application/pdf": "pdf",
};

export const useCloudinary = isCloudinaryConfigured();

let storage;

if (useCloudinary) {
  storage = new CloudinaryStorage({
    cloudinary,
    params: async () => ({
      folder: "ResolveHub",
      resource_type: "auto",
      allowed_formats: ["jpg", "jpeg", "png", "webp", "pdf"],
      public_id: crypto.randomUUID(),
    }),
  });
} else {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });

  storage = multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => {
      cb(
        null,
        `${crypto.randomUUID()}.${ALLOWED_TYPES[file.mimetype]}`
      );
    },
  });
}

const upload = multer({
  storage,

  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 5,
  },

  fileFilter: (req, file, cb) => {
    if (!ALLOWED_TYPES[file.mimetype]) {
      return cb(
        new Error("Only JPG, PNG, WEBP and PDF files are allowed.")
      );
    }

    cb(null, true);
  },
});

// Turn uploaded files into evidence entries for the Dispute model
export const filesToEvidence = (files = [], userId) =>
  files.map((file) => ({
    fileName: file.originalname,
    storage: useCloudinary ? "cloudinary" : "local",
    storedName: file.filename,
    fileUrl: useCloudinary ? file.path : "",
    mimeType: file.mimetype,
    size: file.size,
    uploadedBy: userId,
  }));

// Wrap multer so errors become clean 400 responses
export const uploadEvidence = (req, res, next) => {
  upload.array("evidence", 5)(req, res, (err) => {
    if (!err) return next();

    let message = err.message || "File upload failed.";

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "Each file must be 5 MB or smaller.";
    } else if (err.code === "LIMIT_FILE_COUNT") {
      message = "You can upload up to 5 files.";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected file field. Use 'evidence'.";
    }

    return res.status(400).json({
      success: false,
      message,
    });
  });
};

export default upload;
