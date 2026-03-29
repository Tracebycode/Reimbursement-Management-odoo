import { Router } from "express";
import { createExpense, getExpenses } from "./expense.controller";

const router = Router();

router.post("/expense", createExpense);
router.get("/expenses", getExpenses);

export default router;
