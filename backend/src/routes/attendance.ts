import express from "express";

import * as AttendanceController from "../controllers/attendance";
import { requireAdmin } from "../middleware/requireAdmin";
import { validateRequest } from "../middleware/validateRequest";
import * as AttendanceValidator from "../validators/attendance";

const router = express.Router();

// ---------------------- ROUTES ----------------------
// GET Routes
router.get("/session/:sessionId", AttendanceController.getAttendanceBySessionId);

// POST, PUT Routes
router.post(
  "/",
  requireAdmin,
  AttendanceValidator.createAttendance,
  validateRequest,
  AttendanceController.createAttendance,
);
router.put("/bulk-update", AttendanceController.updateBulkAttendance);
router.put(
  "/:id",
  AttendanceValidator.updateAttendanceById,
  validateRequest,
  AttendanceController.updateAttendanceById,
);

export default router;
