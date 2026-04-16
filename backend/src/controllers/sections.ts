import { Section } from "../models/sections";

import type { SectionDoc } from "../models/sections";
import type { RequestHandler, Response } from "express";

// Shared error helper
const handleError = (res: Response, message: string, status = 400) =>
  res.status(status).json({ message });

// ---------------------- CREATE — admin only ----------------------
export const createSection: RequestHandler = async (req, res) => {
  if (!req.userContext?.admin) {
    return handleError(res, "Forbidden", 403);
  }
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
  | "teachers"
  | "enrolledStudents"
  | "startTime"
  | "endTime"
  | "startDate"
  | "endDate"
  | "archived"
  | "color"
  | "days"
>;

// ---------------------- UPDATE — admin only ----------------------
export const updateSection: RequestHandler<{ id: string }, unknown, UpdateSectionBody> = async (
  req,
  res,
) => {
  if (!req.userContext?.admin) {
    return handleError(res, "Forbidden", 403);
  }
  try {
    const section = await Section.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!section) return handleError(res, `Section ${req.params.id} not found`, 404);
    res.json(section);
  } catch (error: unknown) {
    handleError(res, error instanceof Error ? error.message : "Unknown error");
  }
};

// ---------------------- DELETE — admin only ----------------------
export const deleteSection: RequestHandler<{ id: string }> = async (req, res) => {
  if (!req.userContext?.admin) {
    return handleError(res, "Forbidden", 403);
  }
  try {
    const section = await Section.findByIdAndDelete(req.params.id);
    if (!section) return handleError(res, `Section ${req.params.id} not found`, 404);
    res.status(204).send();
  } catch (error: unknown) {
    handleError(res, error instanceof Error ? error.message : "Unknown error");
  }
};

// ---------------------- GET ONE ----------------------
// Admins: any section
// Teachers: only sections where their UID is in the teachers array
export const getSection: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    const section = await Section.findById(req.params.id);
    if (!section) return handleError(res, `Section ${req.params.id} not found`, 404);

    if (!req.userContext?.admin && !section.teachers.includes(req.userId!)) {
      return handleError(res, "Forbidden", 403);
    }

    res.json(section);
  } catch (error: unknown) {
    handleError(res, error instanceof Error ? error.message : "Unknown error");
  }
};

// ---------------------- GET ALL ----------------------
// Admins: all sections
// Teachers: only sections where their UID is in the teachers array
export const getAllSections: RequestHandler = async (req, res) => {
  const filter = req.userContext?.admin ? {} : { teachers: req.userId };

  try {
    const sections = await Section.find(filter);
    res.json(sections);
  } catch (error: unknown) {
    handleError(res, error instanceof Error ? error.message : "Unknown error");
  }
};
