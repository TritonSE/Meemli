import { Section } from "../models/sections";

import type { SectionDoc } from "../models/sections";
// controllers/sections.ts
import type { RequestHandler, Response } from "express";

// Shared error helper
const handleError = (res: Response, message: string, status = 400) =>
  res.status(status).json({ message });

// ---------------------- CREATE ----------------------
export const createSection: RequestHandler = async (req, res) => {
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
export const updateSection: RequestHandler<{ id: string }, unknown, UpdateSectionBody> = async (
  req,
  res,
) => {
  try {
    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true },
    );

    if (!section) {
      return handleError(res, `Section ${req.params.id} not found`, 404);
    }

    res.json(section);
  } catch (error: unknown) {
    handleError(res, error instanceof Error ? error.message : "Unknown error");
  }
};

// ---------------------- DELETE ----------------------
export const deleteSection: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const section = await Section.findByIdAndDelete(req.params.id);
    if (!section) {
      return handleError(res, `Section ${req.params.id} not found`, 404);
    }

    res.status(204).send();
  } catch (error: unknown) {
    handleError(res, error instanceof Error ? error.message : "Unknown error");
  }
};

// ---------------------- GET ----------------------
export const getSection: RequestHandler<{ id: string }, SectionDoc> = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) {
      return handleError(res, `Section ${req.params.id} not found`, 404);
    }

    res.json(section);
  } catch (error: unknown) {
    handleError(res, error instanceof Error ? error.message : "Unknown error");
  }
};
