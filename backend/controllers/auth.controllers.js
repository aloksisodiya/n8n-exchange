import { adminAuth } from "../config/firebase.js";

/**
 * Authentication middleware
 * Verifies Firebase ID token and attaches user to request
 */
export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized - No token provided',
      });
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    // Attach user info to request
    req.user = decodedToken;

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);

    if (error.code === 'auth/id-token-expired') {
      return res.status(401).json({
        success: false,
        message: 'Token expired',
      });
    }

    if (error.code === 'auth/argument-error') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

/**
 * TODO: Implement the following authentication controllers:
 * 
 * 1. register(req, res)
 *    - POST /api/auth/register
 *    - Body: { email, password, displayName }
 *    - Create user in Firebase Auth
 *    - Create User in MongoDB with initial wallet ($10,000)
 *    - Create empty Portfolio
 *    - Return custom token
 * 
 * 2. login(req, res)
 *    - POST /api/auth/login
 *    - Body: { email }
 *    - Get user by email from Firebase
 *    - Generate custom token
 *    - Update lastLogin in MongoDB
 *    - Return user data and token
 * 
 * 3. googleSignIn(req, res)
 *    - POST /api/auth/google-signin
 *    - Body: { idToken }
 *    - Verify Google ID token
 *    - Create user if doesn't exist (with wallet + portfolio)
 *    - Update lastLogin if exists
 *    - Return custom token
 * 
 * 4. logout(req, res)
 *    - POST /api/auth/logout
 *    - Body: { uid }
 *    - Revoke all refresh tokens for user
 *    - Return success message
 */

// Export placeholder functions (you need to implement these)
export const register = async (req, res) => {
  res.status(501).json({ error: 'Not implemented', message: 'register controller needs to be implemented' });
};

export const login = async (req, res) => {
  res.status(501).json({ error: 'Not implemented', message: 'login controller needs to be implemented' });
};

export const googleSignIn = async (req, res) => {
  res.status(501).json({ error: 'Not implemented', message: 'googleSignIn controller needs to be implemented' });
};

export const logout = async (req, res) => {
  res.status(501).json({ error: 'Not implemented', message: 'logout controller needs to be implemented' });
};
