import pool from "../../libs/db";

// Get user with org_id and manager_id
export const getUserById = async (userId: number) => {
    const result = await pool.query(
        `SELECT id, org_id, name, role, manager_id FROM users WHERE id = $1`,
        [userId]
    );
    return result.rows[0] || null;
};

// Insert expense
export const insertExpense = async (orgId: number, userId: number, amount: number, description: string) => {
    const result = await pool.query(
        `INSERT INTO expenses (org_id, user_id, amount, description, status)
         VALUES ($1, $2, $3, $4, 'pending')
         RETURNING *`,
        [orgId, userId, amount, description]
    );
    return result.rows[0];
};

// Get workflow steps for employee
export const getWorkflowSteps = async (employeeId: number) => {
    const result = await pool.query(
        `SELECT id, step_order, role FROM employee_workflow_steps
         WHERE employee_id = $1
         ORDER BY step_order ASC`,
        [employeeId]
    );
    return result.rows;
};

// Find user by role in same org
export const findUserByRoleAndOrg = async (role: string, orgId: number) => {
    const result = await pool.query(
        `SELECT id, name, role FROM users
         WHERE role = $1 AND org_id = $2
         LIMIT 1`,
        [role, orgId]
    );
    return result.rows[0] || null;
};

// Insert approval step
export const insertApproval = async (
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

// Get all expenses for a user
export const getExpensesByUser = async (userId: number) => {
    const result = await pool.query(
        `SELECT * FROM expenses WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
    );
    return result.rows;
};
