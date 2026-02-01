// routes/sections.ts
import express from "express";

import { createSection, deleteSection, getAllSections, getSection, updateSection } from "../controllers/sections";
import { validateRequest } from "../middleware/validateRequest";
import { createSectionValidator, updateSectionValidator } from "../validators/sections";

const router = express.Router();

// ---------------------- ROUTES ----------------------
router.post("/", createSectionValidator, validateRequest, createSection);

router.put("/:id", updateSectionValidator, validateRequest, updateSection);

router.delete("/:id", deleteSection);
router.get("/:id", getSection);
router.get("/", getAllSections);

export default router;
