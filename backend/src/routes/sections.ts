import express from "express";

import { Section } from "../models/sections";
import { createSectionValidator, updateSectionValidator } from "../validators/sections";

import type { SectionDoc } from "../models/sections";
import type { RequestHandler, Response } from "express";

const router = express.Router();

const handleError = (res: Response, message: string, status = 400) =>
  res.status(status).json({ message });

// ---------------------- CREATE ----------------------
const createSection: RequestHandler = async (req, res: Response) => {
  try {
    const section = new Section(req.body);
    await section.save();
    res.status(201).json(section);
  } catch (error: unknown) {
    handleError(res, error instanceof Error ? error.message : "Unknown error");
  }
};

// Only keep the fields clients can update
export type UpdateSectionBody = Pick<
  SectionDoc,
  | "code"
  | "program"
  | "teachers"
  | "enrolledStudents"
  | "startTime"
  | "endTime"
  | "days"
  | "sessions"
>;

// ---------------------- UPDATE ----------------------
const updateSection: RequestHandler<{ id: string }, unknown, UpdateSectionBody> = async (
  req,
  res: Response,
) => {
  try {
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true },
    );

    if (!section) return handleError(res, `Section ${req.params.id} not found`, 404);

    res.json(section);
  } catch (error: unknown) {
    handleError(res, error instanceof Error ? error.message : "Unknown error");
  }
};

// ---------------------- DELETE ----------------------
const deleteSection: RequestHandler<{ id: string }> = async (req, res: Response) => {
  try {
    const section = await Section.findByIdAndDelete(req.params.id);
    if (!section) return handleError(res, `Section ${req.params.id} not found`, 404);

    res.status(204).send();
  } catch (error: unknown) {
    handleError(res, error instanceof Error ? error.message : "Unknown error");
  }
};

// ---------------------- GET ----------------------
const getSection: RequestHandler<{ id: string }, SectionDoc> = async (req, res: Response) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return handleError(res, `Section ${req.params.id} not found`, 404);

    res.json(section);
  } catch (error: unknown) {
    handleError(res, error instanceof Error ? error.message : "Unknown error");
  }
};

// ---------------------- ROUTES ----------------------
router.post("/", createSectionValidator, createSection);
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
  updateSection,
);
router.delete("/:id", deleteSection);
router.get("/:id", getSection);

export default router;
