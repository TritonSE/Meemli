import express from "express";

import * as StudentsController from "../controllers/students";
import { requireAdmin } from "../middleware/requireAdmin";
import { validateRequest } from "../middleware/validateRequest";
import * as StudentsValidator from "../validators/students";

const router = express.Router();

// ---------------------- ROUTES ----------------------
// GET Routes
router.get("/", StudentsController.getAllStudents);
router.get("/:id", StudentsController.getStudentById);

// POST, PUT Routes
router.post(
  "/",
  requireAdmin,
  StudentsValidator.validateCreateStudent,
  validateRequest,
  StudentsController.createStudent,
);

// Update archived status for multiple students (must be before /:id)
router.put("/archive", requireAdmin, StudentsController.archiveStudentsByIds);

router.put(
  "/:id",
  StudentsValidator.validateEditStudent,
  validateRequest,
  StudentsController.editStudentById,
);

// Batch delete Students by IDs
router.delete("/delete", requireAdmin, StudentsController.deleteStudentsByIds);

// Delete Student by ID
router.delete("/:id", requireAdmin, StudentsController.deleteStudentById);

export default router;
