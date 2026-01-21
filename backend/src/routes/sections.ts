// routes/sections.ts
import express from "express";

import { createSection, deleteSection, getSection, updateSection } from "../controllers/sections";
import { validateRequest } from "../middleware/validateRequest";
import { createSectionValidator, updateSectionValidator } from "../validators/sections";

const router = express.Router();

// ---------------------- ROUTES ----------------------
router.post("/", createSectionValidator, validateRequest, createSection);

router.put(
  "/:id",
  [
    updateSectionValidator.validateCode,
    updateSectionValidator.validateDays,
    updateSectionValidator.validateStartTime,
    updateSectionValidator.validateEndTime,
    updateSectionValidator.validateProgram,
    updateSectionValidator.validateTeachers,
  ],
  validateRequest,
  updateSection,
);

router.delete("/:id", deleteSection);
router.get("/:id", getSection);

export default router;
