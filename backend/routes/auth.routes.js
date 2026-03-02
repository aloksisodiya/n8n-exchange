import express from "express";
import {
  register,
  login,
  logout,
  googleSignIn,
} from "../controllers/auth.controllers.js";

const auth_route = express.Router();

// Auth routes
auth_route.post("/register", register);
auth_route.post("/login", login);
auth_route.post("/logout", logout);
auth_route.post("/google-signin", googleSignIn);

export default auth_route;
