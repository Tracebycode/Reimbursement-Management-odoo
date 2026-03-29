import AppError from "../../utils/Apperror";
import {
    getUserById,
    insertExpense,
    getWorkflowSteps,
    findApproverByRoleAndOrg,
    insertExpenseApproval,
    getActiveApprovalStep,
    updateApprovalStatus,
    updateExpenseStatus,
    countPendingSteps,
} from "./employee.repository";

export const createExpense = async (userId: number, amount: number, description: string) => {
    // 1. Validate user exists and get their org
    const user = await getUserById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    // 2. Insert the expense
    const expense = await insertExpense(user.org_id, userId, amount, description);

    // 3. Fetch employee's workflow steps
    const workflowSteps = await getWorkflowSteps(userId);

    if (workflowSteps.length === 0) {
        throw new AppError("No approval workflow defined for this employee", 400);
    }

    // 4. For each step, resolve the approver and create approval rows
    const approvals = [];

    for (const step of workflowSteps) {
        const approver = await findApproverByRoleAndOrg(step.role, user.org_id);

        if (!approver) {
            throw new AppError(
                `No approver found with role "${step.role}" in this organization`,
                400
            );
        }

        const approval = await insertExpenseApproval(expense.id, approver.id, step.step_order);
        approvals.push({
            ...approval,
            approver_name: approver.name,
            approver_role: approver.role,
        });
    }

    return { expense, approvals };
};

export const approveExpense = async (
    expenseId: number,
    approverId: number,
    action: string,
    comment?: string
) => {
    // 1. Find the current active step (lowest pending step_order)
    const activeStep = await getActiveApprovalStep(expenseId);

    if (!activeStep) {
        throw new AppError("No pending approval steps for this expense", 400);
    }

    // 2. Validate that this approver is assigned to the active step
    if (activeStep.approver_id !== approverId) {
        throw new AppError(
            "You are not the approver for the current step",
            403
        );
    }

    // 3. Handle rejection — reject the step and the entire expense
    if (action === "rejected") {
        const updatedStep = await updateApprovalStatus(activeStep.id, "rejected", comment);
        const updatedExpense = await updateExpenseStatus(expenseId, "rejected");

        return {
            expense: updatedExpense,
            step: updatedStep,
            message: "Expense has been rejected",
        };
    }

    // 4. Handle approval — approve the step
    const updatedStep = await updateApprovalStatus(activeStep.id, "approved", comment);

    // 5. Check if there are more pending steps
    const remaining = await countPendingSteps(expenseId);

    if (remaining === 0) {
        // All steps done → mark expense as approved
        const updatedExpense = await updateExpenseStatus(expenseId, "approved");
        return {
            expense: updatedExpense,
            step: updatedStep,
            message: "All steps approved. Expense is now approved",
        };
    }

    // More steps remain — expense stays pending
    return {
        step: updatedStep,
        remaining_steps: remaining,
        message: "Step approved. Waiting for next approver",
    };
};
