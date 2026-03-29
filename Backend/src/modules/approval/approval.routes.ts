import { Router } from "express";
import { approveExpense, getPendingApprovals } from "./approval.controller";

const router = Router();

router.post("/approve", approveExpense);
router.get("/pending-approvals", getPendingApprovals);

export default router;
