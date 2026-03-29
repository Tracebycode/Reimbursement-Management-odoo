import express from "express";
import cors from "cors";
import workflowRoutes from "./modules/employee/workflow.routes";
import expenseRoutes from "./modules/expense/expense.routes";
import approvalRoutes from "./modules/approval/approval.routes";
import userRoutes from "./modules/users/user.routes";
import authRoutes from "./modules/auth/auth.routes";
import { globalErrorHandler } from "./middleware/globalerrorhandler";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api", workflowRoutes);
app.use("/api", expenseRoutes);
app.use("/api", approvalRoutes);
app.use("/api", userRoutes);
app.use("/api/auth", authRoutes);

// Global error handler (must be last)
app.use(globalErrorHandler);

export default app;
