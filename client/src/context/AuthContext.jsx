import { createContext, useContext, useState, useEffect } from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../config/firebase";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is logged in on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser && savedUser !== "undefined") {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error("Failed to parse saved user:", error);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const { user, token } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    }
  };

  const register = async (email, password, displayName) => {
    try {
      const response = await authAPI.register({ email, password, displayName });
      const { user, token } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Registration failed",
      };
    }
  };

  const logout = async () => {
    try {
      if (user?.uid) {
        await authAPI.logout({ uid: user.uid });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Sign in with Google popup
      const result = await signInWithPopup(auth, googleProvider);

      // Get the ID token from Google
      const idToken = await result.user.getIdToken();

      // Send the ID token to your backend
      const response = await authAPI.googleSignIn({ idToken });
      const { user, token } = response.data.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);

      return { success: true };
    } catch (error) {
      console.error("Google sign-in error:", error);

      // Handle specific Firebase errors
      if (error.code === "auth/operation-not-allowed") {
        return {
          success: false,
          message:
            "Google Sign-In is not enabled. Please enable it in Firebase Console > Authentication > Sign-in method.",
        };
      }

      if (error.code === "auth/popup-closed-by-user") {
        return {
          success: false,
          message: "Sign-in cancelled",
        };
      }

      if (error.code === "auth/popup-blocked") {
        return {
          success: false,
          message: "Pop-up was blocked. Please allow pop-ups for this site.",
        };
      }

      if (error.code === "auth/unauthorized-domain") {
        return {
          success: false,
          message:
            "This domain is not authorized. Add it to Firebase Console > Authentication > Settings > Authorized domains.",
        };
      }

      if (error.code === "auth/configuration-not-found") {
        return {
          success: false,
          message:
            "Firebase configuration is missing. Please check your .env file.",
        };
      }

      return {
        success: false,
        message:
          error.response?.data?.message ||
          error.message ||
          "Google sign-in failed",
      };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    signInWithGoogle,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
