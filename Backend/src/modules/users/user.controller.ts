import { Request, Response, NextFunction } from "express";
import AppError from "../../utils/Apperror";
import {
    insertUser,
    getUsersByOrg,
    getUserById,
} from "./users.repository";

// POST /users
export const createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { org_id, name, email, role, manager_id } = req.body;

        if (!org_id || !name || !email || !role) {
            throw new AppError("org_id, name, email, and role are required", 400);
        }

        if (typeof role !== "string" || role.trim() === "") {
            throw new AppError("role must be a non-empty string", 400);
        }

        const user = await insertUser(org_id, name, email, role, manager_id);

        res.status(201).json({
            message: "User created successfully",
            data: user,
        });
    } catch (err: any) {
        // Handle unique email violation
        if (err.code === "23505") {
            return next(new AppError("Email already exists", 409));
        }
        next(err);
    }
};

// GET /users?org_id=1
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orgId = parseInt(req.query.org_id as string, 10);

        if (!orgId || isNaN(orgId)) {
            throw new AppError("org_id query param is required", 400);
        }

        const users = await getUsersByOrg(orgId);

        res.status(200).json({
            message: "Users fetched successfully",
            count: users.length,
            data: users,
        });
    } catch (err) {
        next(err);
    }
};

// GET /users/:id
export const getUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = parseInt(req.params.id as string, 10);

        if (isNaN(userId)) {
            throw new AppError("Invalid user id", 400);
        }

        const user = await getUserById(userId);

        if (!user) {
            throw new AppError("User not found", 404);
        }

        res.status(200).json({
            message: "User fetched successfully",
            data: user,
        });
    } catch (err) {
        next(err);
    }
};

