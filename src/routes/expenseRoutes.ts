import express from "express";
import { handleAddExpense, handleDeleteExpense } from "../controllers/expenses";
import { authMiddleware } from "../controllers/authMiddleware";

const router = express.Router();

router.post("/add", authMiddleware, handleAddExpense);
router.delete("/delete", authMiddleware, handleDeleteExpense);
export default router;
