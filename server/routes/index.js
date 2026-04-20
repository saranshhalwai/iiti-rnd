import { Router } from "express";
import authRoutes from "./auth.js";
import mailRoutes from "./mail.js";
import projectController from "../controllers/projectController.js";
import adminController from "../controllers/adminController.js";
import verifyUser from "../middlewares/verifyUser.js";
import verifyAdmin from "../middlewares/verifyAdmin.js";

const router = Router();
router.use("/auth", authRoutes);
router.use("/admin", verifyAdmin, adminController);
router.use("/project", verifyUser, projectController);
router.use("/mail", mailRoutes);
export default router;