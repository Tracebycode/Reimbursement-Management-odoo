import { Request, Response, NextFunction } from "express";
import AppError from "../../utils/Apperror";
import {
    getActiveStep,
    updateApprovalStep,
    updateExpenseStatus,
    countPendingSteps,
    getPendingForApprover,
} from "./approval.repository";

// POST /approve
export const approveExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { expense_id, approver_id, action, comment } = req.body;

        // ── Input validation ──
        if (!expense_id || !approver_id || !action) {
            throw new AppError("expense_id, approver_id, and action are required", 400);
        }

        if (!["approved", "rejected"].includes(action)) {
            throw new AppError('action must be "approved" or "rejected"', 400);
        }

        // ── Step 1: Find the current active step ──
        const activeStep = await getActiveStep(expense_id);

        if (!activeStep) {
            throw new AppError("No pending approval steps for this expense", 400);
        }

        // ── Step 2: Validate approver ──
        if (activeStep.approver_id !== approver_id) {
            throw new AppError("Not authorized for this step", 403);
        }

        // ── Step 3: Handle REJECTION ──
        if (action === "rejected") {
            const updatedStep = await updateApprovalStep(activeStep.id, "rejected", comment);
            const updatedExpense = await updateExpenseStatus(expense_id, "rejected");

            return res.status(200).json({
                message: "Expense has been rejected",
                data: {
                    expense: updatedExpense,
                    step: updatedStep,
                },
            });
        }

        // ── Step 4: Handle APPROVAL ──
        const updatedStep = await updateApprovalStep(activeStep.id, "approved", comment);

        // ── Step 5: Check if more steps remain ──
        const remaining = await countPendingSteps(expense_id);

        if (remaining === 0) {
            // All steps approved → mark expense approved
            const updatedExpense = await updateExpenseStatus(expense_id, "approved");

            return res.status(200).json({
                message: "All steps approved. Expense is now approved",
                data: {
                    expense: updatedExpense,
                    step: updatedStep,
                },
            });
        }

        // More steps remain → expense stays pending
        return res.status(200).json({
            message: "Step approved. Waiting for next approver",
            data: {
                step: updatedStep,
                remaining_steps: remaining,
            },
        });
    } catch (err) {
        next(err);
    }
};

// GET /pending-approvals?approver_id=5
export const getPendingApprovals = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const approverId = parseInt(req.query.approver_id as string, 10);

        if (!approverId || isNaN(approverId)) {
            throw new AppError("approver_id query param is required", 400);
        }

        const approvals = await getPendingForApprover(approverId);

        res.status(200).json({
            message: "Pending approvals fetched successfully",
            count: approvals.length,
            data: approvals,
        });
    } catch (err) {
        next(err);
    }
};
