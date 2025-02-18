import express from "express";
import { handleAddExpense } from "../controllers/expenses";
import { authMiddleware } from "../controllers/authMiddleware";

const router = express.Router();

router.post("/add", authMiddleware, handleAddExpense);
export default router;
