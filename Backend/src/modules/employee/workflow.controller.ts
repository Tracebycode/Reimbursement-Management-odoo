import { Request, Response, NextFunction } from "express";
import AppError from "../../utils/Apperror";
import {
    getWorkflowSteps,
    deleteWorkflowSteps,
    insertWorkflowStep,
} from "./employee.repository";

// POST /workflow
export const setWorkflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { employee_id, steps } = req.body;

        if (!employee_id) {
            throw new AppError("employee_id is required", 400);
        }

        if (!Array.isArray(steps) || steps.length === 0) {
            throw new AppError("steps must be a non-empty array", 400);
        }

        // Validate step_order uniqueness
        const orders = steps.map((s: any) => s.step_order);
        const uniqueOrders = new Set(orders);
        if (uniqueOrders.size !== orders.length) {
            throw new AppError("step_order must be unique for each step", 400);
        }

        // Validate each step has required fields
        for (const step of steps) {
            if (!step.step_order || !step.role) {
                throw new AppError("Each step must have step_order and role", 400);
            }
        }

        // Delete existing steps and insert new ones
        await deleteWorkflowSteps(employee_id);

        const insertedSteps = [];
        // Sort by step_order before inserting
        const sorted = steps.sort((a: any, b: any) => a.step_order - b.step_order);

        for (const step of sorted) {
            const inserted = await insertWorkflowStep(employee_id, step.step_order, step.role);
            insertedSteps.push(inserted);
        }

        res.status(201).json({
            message: "Workflow set successfully",
            data: insertedSteps,
        });
    } catch (err) {
        next(err);
    }
};

// GET /workflow/:employee_id
export const getWorkflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employeeId = parseInt(req.params.employee_id as string, 10);

        if (isNaN(employeeId)) {
            throw new AppError("Invalid employee_id", 400);
        }

        const steps = await getWorkflowSteps(employeeId);

        res.status(200).json({
            message: "Workflow fetched successfully",
            data: steps,
        });
    } catch (err) {
        next(err);
    }
};

// DELETE /workflow/:employee_id
export const deleteWorkflow = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const employeeId = parseInt(req.params.employee_id as string, 10);

        if (isNaN(employeeId)) {
            throw new AppError("Invalid employee_id", 400);
        }

        await deleteWorkflowSteps(employeeId);

        res.status(200).json({
            message: "Workflow deleted successfully",
        });
    } catch (err) {
        next(err);
    }
};
