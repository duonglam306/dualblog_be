import express from "express";
import {
    sendMailSignUp
} from "../controllers/mailerControllers.js";
import { protect } from "../middleware/authMiddleware.js";
const router = express.Router();

router.post("/signUp", protect, sendMailSignUp);

export default router;
