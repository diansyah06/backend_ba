import express from "express";
import authController from "../controllers/auth.controller";
import baController from "../controllers/ba.controller";
import authMiddleware from "../middlewares/auth.middleware";

const router = express.Router();

// --- [MIDDLEWARE PALSU KHUSUS TESTING SOCKET] ---
const fakeAuthMiddleware = (req: any, res: any, next: any) => {
  // Kita paksa backend menganggap request ini dari User Biasa (Staf)
  req.user = {
    id: "691c916eae5a40b42af36904", // <-- Masukkan ID User Biasa (Staf)
    fullname: "Budi (Staf)"
  };
  next();
};

// Route Auth (Biarkan Normal)
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.get("/auth/me", authMiddleware, authController.me);

// --- [UBAH ROUTE INI: GANTI authMiddleware JADI fakeAuthMiddleware] ---
router.post("/ba", fakeAuthMiddleware, baController.create); 

export default router;