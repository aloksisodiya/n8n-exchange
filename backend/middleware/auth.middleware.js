import { adminAuth } from "../config/firebase.js";

/**
 * Authentication middleware
 * Verifies Firebase ID token and attaches user to request
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - No token provided",
      });
    }

    const token = authHeader.split("Bearer ")[1];

    // Verify Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(token);

    // Attach user info to request
    req.user = decodedToken;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);

    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    if (error.code === "auth/argument-error") {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};
