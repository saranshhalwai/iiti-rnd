import { Router } from "express"
import authController from "../controllers/authController.js"

const router = Router();
router.use("/auth", authController);

export default router;