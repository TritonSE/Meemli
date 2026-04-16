// routes/sections.ts
import express from "express";

import {
  createSection,
  deleteSection,
  getAllSections,
  getSection,
  updateSection,
} from "../controllers/sections";
import { requireAdmin } from "../middleware/requireAdmin";
import { validateRequest } from "../middleware/validateRequest";
import { createSectionValidator, updateSectionValidator } from "../validators/sections";

const router = express.Router();

// ---------------------- ROUTES ----------------------
router.post("/", requireAdmin, createSectionValidator, validateRequest, createSection);

router.put("/:id", requireAdmin, updateSectionValidator, validateRequest, updateSection);

router.delete("/:id", requireAdmin, deleteSection);
router.get("/:id", getSection);
router.get("/", getAllSections);

export default router;
