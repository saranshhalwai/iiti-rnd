import { Router } from "express";
import authRoutes from "./auth.js";
import projectController from "../controllers/projectController.js";
import mailRouter from "../controllers/mailController.js";
import verifyUser from "../middlewares/verifyUser.js";

const router = Router();
router.use("/auth", authRoutes);
router.use("/project", verifyUser, projectController);
router.use("/mail", mailRouter);
export default router;
