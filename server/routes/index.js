import { Router } from "express"
import authRoutes from "./auth.js"
import projectController from "../controllers/projectController.js"

const router = Router();
router.use("/auth", authRoutes);
router.use("/projects", projectController);
export default router;