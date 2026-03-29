import { Router, Request, Response, NextFunction } from "express";
import { approveExpense } from "./employee.service";
import AppError from "../../utils/Apperror";

const router = Router();

// POST /approve
router.post("/approve", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { expense_id, approver_id, action, comment } = req.body;

        // Basic validation
        if (!expense_id || !approver_id || !action) {
            throw new AppError("expense_id, approver_id, and action are required", 400);
        }

        if (!["approved", "rejected"].includes(action)) {
            throw new AppError('action must be "approved" or "rejected"', 400);
        }

        const result = await approveExpense(expense_id, approver_id, action, comment);

        res.status(200).json({
            message: result.message,
            data: result,
        });
    } catch (err) {
        next(err);
    }
});

export default router;
