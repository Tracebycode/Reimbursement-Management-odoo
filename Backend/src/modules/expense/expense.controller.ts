import { Request, Response, NextFunction } from "express";
import AppError from "../../utils/Apperror";
import {
    getUserById,
    insertExpense,
    getWorkflowSteps,
    findUserByRoleAndOrg,
    insertApproval,
    getExpensesByUser,
} from "./expense.repository";

// POST /expense
export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { user_id, amount, description } = req.body;

        // Validation
        if (!user_id || !amount) {
            throw new AppError("user_id and amount are required", 400);
        }

        if (typeof amount !== "number" || amount <= 0) {
            throw new AppError("amount must be a positive number", 400);
        }

        // 1. Get the user (need org_id and manager_id)
        const user = await getUserById(user_id);
        if (!user) {
            throw new AppError("User not found", 404);
        }

        // 2. Insert expense
        const expense = await insertExpense(user.org_id, user_id, amount, description || "");

        // 3. Fetch workflow steps
        const workflowSteps = await getWorkflowSteps(user_id);

        if (workflowSteps.length === 0) {
            throw new AppError("No approval workflow defined for this employee", 400);
        }

        // 4. For each step, resolve the approver and create approval rows
        const approvals = [];

        for (const step of workflowSteps) {
            let approverId: number | null = null;
            let approverName: string = "";
            let approverRole: string = step.role;

            if (step.role === "manager") {
                // Use the employee's manager_id
                if (!user.manager_id) {
                    throw new AppError(
                        "Employee has no manager assigned but workflow requires manager approval",
                        400
                    );
                }

                const manager = await getUserById(user.manager_id);
                if (!manager) {
                    throw new AppError("Assigned manager not found in system", 404);
                }

                approverId = manager.id;
                approverName = manager.name;
                approverRole = manager.role;
            } else {
                // Find user with matching role in same org
                const approver = await findUserByRoleAndOrg(step.role, user.org_id);
                if (!approver) {
                    throw new AppError(
                        `No user found with role "${step.role}" in this organization`,
                        400
                    );
                }

                approverId = approver.id;
                approverName = approver.name;
                approverRole = approver.role;
            }

            const approval = await insertApproval(expense.id, approverId!, step.step_order);
            approvals.push({
                ...approval,
                approver_name: approverName,
                approver_role: approverRole,
            });
        }

        res.status(201).json({
            message: "Expense created successfully",
            data: { expense, approvals },
        });
    } catch (err) {
        next(err);
    }
};

// GET /expenses?user_id=1
export const getExpenses = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = parseInt(req.query.user_id as string, 10);

        if (!userId || isNaN(userId)) {
            throw new AppError("user_id query param is required", 400);
        }

        const expenses = await getExpensesByUser(userId);

        res.status(200).json({
            message: "Expenses fetched successfully",
            count: expenses.length,
            data: expenses,
        });
    } catch (err) {
        next(err);
    }
};
