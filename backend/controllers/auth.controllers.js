import { adminAuth } from "../config/firebase.js";

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

    // Generate custom token for the backend
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    res.json({
      success: true,
      message: "Google sign-in successful",
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        photoURL: userRecord.photoURL,
        emailVerified: userRecord.emailVerified,
      },
      token: customToken,
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

    // Generate custom token for immediate login
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
      },
      token: customToken,
    });
  } catch (error) {
    console.error("Registration error:", error.message);
    console.error("Error code:", error.code);
    console.error("Full error:", error);

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

    // Generate custom token
    const customToken = await adminAuth.createCustomToken(userRecord.uid);

    res.json({
      success: true,
      message: "Login successful",
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        emailVerified: userRecord.emailVerified,
      },
      token: customToken,
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
