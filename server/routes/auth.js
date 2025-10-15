import { Router } from "express"
import userLogin from "../controllers/authController.js"
import adminLogin from "../controllers/adminAuthController.js";

const router = Router();
router.use("/admin", adminLogin);
router.use("/", userLogin);
export default router;