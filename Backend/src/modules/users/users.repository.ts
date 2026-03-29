import pool from "../../libs/db";

// ──────────────── User CRUD ────────────────

// Insert a new user
export const insertUser = async (
    orgId: number,
    name: string,
    email: string,
    role: string,
    managerId?: number,
    password?: string
) => {
    const result = await pool.query(
        `INSERT INTO users (org_id, name, email, role, manager_id, password)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [orgId, name, email, role, managerId || null, password || "password123"]
    );
    return result.rows[0];
};

// Get all users by org_id
export const getUsersByOrg = async (orgId: number) => {
    const result = await pool.query(
        `SELECT * FROM users WHERE org_id = $1 ORDER BY created_at DESC`,
        [orgId]
    );
    return result.rows;
};

// Get single user by id
export const getUserById = async (userId: number) => {
    const result = await pool.query(
        `SELECT * FROM users WHERE id = $1`,
        [userId]
    );
    return result.rows[0] || null;
};

// ──────────────── Pending Approvals ────────────────

// Get pending approvals where this approver is next in line (active step)
export const getPendingApprovalsForApprover = async (approverId: number) => {
    const result = await pool.query(
        `SELECT
            ea.id AS approval_id,
            ea.expense_id,
            ea.step_order,
            ea.status,
            e.amount,
            e.description,
            e.created_at AS expense_created_at
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
