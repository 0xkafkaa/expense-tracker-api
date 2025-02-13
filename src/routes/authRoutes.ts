import express from "express";
import { handleSignUp } from "../controllers/auth";

const router = express.Router();

router.post("/signup", handleSignUp);

export default router;
