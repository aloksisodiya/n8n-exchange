import admin from "firebase-admin";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load service account key
const serviceAccount = JSON.parse(
  readFileSync(
    join(
      __dirname,
      "..",
      "n8n-exchange-d9fef-firebase-adminsdk-fbsvc-239e00ad71.json",
    ),
    "utf8",
  ),
);

// Initialize Firebase Admin (only if not already initialized)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Export auth as a function to get the current auth instance
export const adminAuth = admin.auth();
export default admin;
