import { adminAuth } from "../config/firebase.js";
import { User, Portfolio } from "../models/index.js";

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

/**
 * Register a new user
 */
export const register = async (req, res) => {
  try {
    const { email, password, displayName } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Bad request",
        message: "Email and password are required",
      });
    }

    // Create user in Firebase
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: displayName || null,
      emailVerified: false,
    });

    // Create user in MongoDB
    const user = new User({
      uid: userRecord.uid,
      email: userRecord.email,
      displayName: userRecord.displayName,
      provider: "email",
      wallet: {
        balance: 10000,
        currency: "USD",
      },
    });
    await user.save();

    // Create initial empty portfolio
    const portfolio = new Portfolio({ userId: user.uid });
    await portfolio.save();

    console.log(`✅ New user registered: ${user.email}`);

    // Generate custom token for immediate login
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
        },
        token: customToken,
      },
    });
  } catch (error) {
    console.error("Registration error:", error.message);

    if (error.code === "auth/email-already-exists") {
      return res.status(409).json({
        error: "Email already exists",
        message: "This email is already registered",
      });
    }

    res.status(500).json({
      error: "Server error",
      message: "Failed to register user",
    });
  }
};

/**
 * Login user (creates custom token)
 */
export const login = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Bad request",
        message: "Email is required",
      });
    }

    // Get user by email
    const userRecord = await adminAuth.getUserByEmail(email);

    // Update lastLogin in MongoDB
    const user = await User.findOne({ uid: userRecord.uid });
    if (user) {
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate custom token
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          emailVerified: userRecord.emailVerified,
        },
        token: customToken,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    if (error.code === "auth/user-not-found") {
      return res.status(404).json({
        error: "User not found",
        message: "No user found with this email",
      });
    }

    res.status(500).json({
      error: "Server error",
      message: "Failed to login",
    });
  }
};

/**
 * Google Sign-In (verify ID token and create custom token)
 */
export const googleSignIn = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        error: "Bad request",
        message: "ID token is required",
      });
    }

    // Verify the Google ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Get or create user
    let userRecord;
    try {
      userRecord = await adminAuth.getUser(uid);
    } catch (error) {
      if (error.code === "auth/user-not-found") {
        // User doesn't exist, create one
        userRecord = await adminAuth.createUser({
          uid: uid,
          email: decodedToken.email,
          displayName: decodedToken.name,
          photoURL: decodedToken.picture,
          emailVerified: decodedToken.email_verified,
        });
      } else {
        throw error;
      }
    }

    // Create or update user in MongoDB
    let user = await User.findOne({ uid: userRecord.uid });
    if (!user) {
      user = new User({
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        provider: "google",
        wallet: {
          balance: 10000,
          currency: "USD",
        },
      });
      await user.save();

      // Create initial empty portfolio
      const portfolio = new Portfolio({ userId: user.uid });
      await portfolio.save();

      console.log(`✅ New user created: ${user.email}`);
    } else {
      user.lastLogin = new Date();
      await user.save();
    }

    // Generate custom token for the backend
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    res.json({
      success: true,
      message: "Google sign-in successful",
      data: {
        user: {
          uid: userRecord.uid,
          email: userRecord.email,
          displayName: userRecord.displayName,
          photoURL: userRecord.photoURL,
          emailVerified: userRecord.emailVerified,
        },
        token: customToken,
      },
    });
  } catch (error) {
    console.error("Google sign-in error:", error.message);

    if (error.code === "auth/id-token-expired") {
      return res.status(401).json({
        error: "Token expired",
        message: "The ID token has expired",
      });
    }

    if (error.code === "auth/invalid-id-token") {
      return res.status(401).json({
        error: "Invalid token",
        message: "The ID token is invalid",
      });
    }

    res.status(500).json({
      error: "Server error",
      message: "Failed to authenticate with Google",
    });
  }
};

/**
 * Logout user (revoke refresh tokens)
 */
export const logout = async (req, res) => {
  try {
    const { uid } = req.body;

    if (!uid) {
      return res.status(400).json({
        error: "Bad request",
        message: "User ID is required",
      });
    }

    // Revoke all refresh tokens for the user
    await adminAuth.revokeRefreshTokens(uid);

    res.json({
      success: true,
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Logout error:", error.message);

    res.status(500).json({
      error: "Server error",
      message: "Failed to logout",
    });
  }
};
