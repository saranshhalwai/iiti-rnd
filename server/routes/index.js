import { Router } from "express"
import authRoutes from "./auth.js"
import projectController from "../controllers/projectController.js"
import verifyUser from "../middlewares/verifyUser.js";

const router = Router();
router.use("/auth", authRoutes);
router.use("/project", verifyUser, projectController);
export default router;