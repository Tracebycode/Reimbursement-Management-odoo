import pool from "../../libs/db";

// Find the current active step (lowest pending step_order for an expense)
export const getActiveStep = async (expenseId: number) => {
    const result = await pool.query(
        `SELECT * FROM expense_approvals
         WHERE expense_id = $1 AND status = 'pending'
         ORDER BY step_order ASC
         LIMIT 1`,
        [expenseId]
    );
    return result.rows[0] || null;
};

// Update an approval step's status and comment
export const updateApprovalStep = async (approvalId: number, status: string, comment?: string) => {
    const result = await pool.query(
        `UPDATE expense_approvals
         SET status = $1, comment = $2
         WHERE id = $3
         RETURNING *`,
        [status, comment || null, approvalId]
    );
    return result.rows[0];
};

// Update the expense's overall status
export const updateExpenseStatus = async (expenseId: number, status: string) => {
    const result = await pool.query(
        `UPDATE expenses SET status = $1 WHERE id = $2 RETURNING *`,
        [status, expenseId]
    );
    return result.rows[0];
};

// Count remaining pending steps for an expense
export const countPendingSteps = async (expenseId: number) => {
    const result = await pool.query(
        `SELECT COUNT(*)::int AS count FROM expense_approvals
         WHERE expense_id = $1 AND status = 'pending'`,
        [expenseId]
    );
    return result.rows[0].count;
};

// Get pending approvals where this approver is the active step
export const getPendingForApprover = async (approverId: number) => {
    const result = await pool.query(
        `SELECT
            ea.id AS approval_id,
            ea.expense_id,
            ea.step_order,
            ea.status AS approval_status,
            e.amount,
            e.description,
            e.status AS expense_status
         FROM expense_approvals ea
         JOIN expenses e ON e.id = ea.expense_id
         WHERE ea.approver_id = $1
           AND ea.status = 'pending'
           AND ea.step_order = (
               SELECT MIN(ea2.step_order)
               FROM expense_approvals ea2
               WHERE ea2.expense_id = ea.expense_id
                 AND ea2.status = 'pending'
           )
         ORDER BY e.created_at ASC`,
        [approverId]
    );
    return result.rows;
};
