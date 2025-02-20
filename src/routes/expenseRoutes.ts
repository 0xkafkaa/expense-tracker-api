import express from "express";
import {
  handleAddExpense,
  handleDeleteExpense,
  handleGetExpenses,
} from "../controllers/expenses";
import { authMiddleware } from "../controllers/authMiddleware";

const router = express.Router();

router.get("/all", authMiddleware, handleGetExpenses);
router.post("/add", authMiddleware, handleAddExpense);
router.delete("/delete", authMiddleware, handleDeleteExpense);

export default router;
