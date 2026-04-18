import express from "express";

import {
  createSection,
  deleteSection,
  getAllSections,
  getSection,
  updateSection,
} from "../controllers/sections";
import { validateRequest } from "../middleware/validateRequest";
import { createSectionValidator, updateSectionValidator } from "../validators/sections";

const router = express.Router();

// ---------------------- ROUTES ----------------------
// GET Routes
router.get("/:id", getSection);
router.get("/", getAllSections);

// POST, PUT Routes
router.post("/", createSectionValidator, validateRequest, createSection);
router.put("/:id", updateSectionValidator, validateRequest, updateSection);

// DELETE Routes
router.delete("/:id", deleteSection);

export default router;
