import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import router from "./routes/routes.js";
import admin from "./config/firebase.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Verify Firebase initialization
console.log("Firebase Admin initialized:", admin.apps.length ? "✓" : "✗");

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "n8n Exchange API",
    status: "running",
  });
});

app.use("/api", router);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("Firebase Authentication enabled");
});
