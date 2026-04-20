import express from "express";
import hodMail from "../controllers/mailController/hodMail.js"
import deanMail from "../controllers/mailController/deanMail.js"
const router = express.Router();

router.use('/hod', hodMail);
router.use('/dean', deanMail);

export default router;