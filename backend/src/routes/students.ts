import express from "express";

import * as StudentsController from "../controllers/students";
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
  StudentsValidator.validateCreateStudent,
  validateRequest,
  StudentsController.createStudent,
);
router.put(
  "/:id",
  StudentsValidator.validateEditStudent,
  validateRequest,
  StudentsController.editStudentById,
);

// Update archived status for multiple students
router.put("/archive", StudentsController.archiveStudentsByIds);

// Edit Student by ID
router.put("/:id", StudentsValidator.validateEditStudent, StudentsController.editStudentById);

// Batch delete Students by IDs
router.delete("/delete", StudentsController.deleteStudentsByIds);

// Delete Student by ID
router.delete("/:id", StudentsController.deleteStudentById);

export default router;
