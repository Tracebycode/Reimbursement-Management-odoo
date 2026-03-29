import pool from "../../libs/db";

// Get user's org_id
export const getUserById = async (userId: number) => {
    const result = await pool.query(
        `SELECT id, org_id, name, role FROM users WHERE id = $1`,
        [userId]
    );
    return result.rows[0] || null;
};

// Insert a new expense
export const insertExpense = async (orgId: number, userId: number, amount: number, description: string) => {
    const result = await pool.query(
        `INSERT INTO expenses (org_id, user_id, amount, description, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING *`,
        [orgId, userId, amount, description]
    );
    return result.rows[0];
};

// Fetch workflow steps for an employee (ordered by step_order)
export const getWorkflowSteps = async (employeeId: number) => {
    const result = await pool.query(
        `SELECT id, step_order, role FROM employee_workflow_steps
         WHERE employee_id = $1
         ORDER BY step_order ASC`,
        [employeeId]
    );
    return result.rows;
};

// Delete all workflow steps for an employee
export const deleteWorkflowSteps = async (employeeId: number) => {
    await pool.query(
        `DELETE FROM employee_workflow_steps WHERE employee_id = $1`,
        [employeeId]
    );
};

// Insert a single workflow step
export const insertWorkflowStep = async (employeeId: number, stepOrder: number, role: string) => {
    const result = await pool.query(
        `INSERT INTO employee_workflow_steps (employee_id, step_order, role)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [employeeId, stepOrder, role]
    );
    return result.rows[0];
};

// Find a user with a given role in the same org
export const findApproverByRoleAndOrg = async (role: string, orgId: number) => {
    const result = await pool.query(
        `SELECT id, name, role FROM users
         WHERE role = $1 AND org_id = $2
         LIMIT 1`,
        [role, orgId]
    );
    return result.rows[0] || null;
};

// Insert an approval row
export const insertExpenseApproval = async (
    expenseId: number,
    approverId: number,
    stepOrder: number
) => {
    const result = await pool.query(
        `INSERT INTO expense_approvals (expense_id, approver_id, step_order, status)
         VALUES ($1, $2, $3, 'pending')
         RETURNING *`,
        [expenseId, approverId, stepOrder]
    );
    return result.rows[0];
};

// Get the current active approval step (lowest pending step_order)
export const getActiveApprovalStep = async (expenseId: number) => {
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
export const updateApprovalStatus = async (approvalId: number, status: string, comment?: string) => {
    const result = await pool.query(
        `UPDATE expense_approvals
         SET status = $2, comment = $3
         WHERE id = $1
         RETURNING *`,
        [approvalId, status, comment || null]
    );
    return result.rows[0];
};

// Update the expense's overall status
export const updateExpenseStatus = async (expenseId: number, status: string) => {
    const result = await pool.query(
        `UPDATE expenses SET status = $2 WHERE id = $1 RETURNING *`,
        [expenseId, status]
    );
    return result.rows[0];
};

// Count remaining pending steps for an expense
export const countPendingSteps = async (expenseId: number) => {
    const result = await pool.query(
        `SELECT COUNT(*) as count FROM expense_approvals
         WHERE expense_id = $1 AND status = 'pending'`,
        [expenseId]
    );
    return parseInt(result.rows[0].count, 10);
};
