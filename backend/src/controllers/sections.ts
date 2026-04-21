import { Section } from "../models/sections";
import { SessionModel } from "../models/session";

import type { SectionDoc } from "../models/sections";
// controllers/sections.ts
import type { RequestHandler, Response } from "express";

// Shared error helper
const handleError = (res: Response, message: string, status = 400) =>
  res.status(status).json({ message });

// Populate sessions list
const populateSessions = async (section: SectionDoc) => {
  const today = new Date();
  const sectionEndDate = new Date(section.endDate);
  const sectionStartDate = new Date(section.startDate);
  const sessionDates = [];

  let sessionDate = new Date(sectionStartDate) > today ? new Date(sectionStartDate) : today;
  while (sessionDate >= today && sessionDate <= sectionEndDate) {
    if (
      section.days.includes(
        sessionDate.toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" }),
      )
    ) {
      sessionDates.push(new Date(sessionDate));
    }
    sessionDate = new Date(sessionDate.setDate(sessionDate.getDate() + 1));
  }

  return sessionDates;
};

// ---------------------- CREATE ----------------------
export const createSection: RequestHandler = async (req, res) => {
  try {
    const section = new Section(req.body);
    await section.save();

    const sessionDates = await populateSessions(section);

    await Promise.all(
      sessionDates.map(async (date: Date) => {
        await SessionModel.create({
          section: section._id,
          sessionDate: date,
        });
      }),
    );

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

    await SessionModel.deleteMany({ section: section._id, sessionDate: { $gt: new Date() } });

    const sessionDates = await populateSessions(section);

    await Promise.all(
      sessionDates.map(async (date: Date) => {
        const session = await SessionModel.findOne({ section: section._id, sessionDate: date });
        if (!session) {
          await SessionModel.create({
            section: section._id,
            sessionDate: date,
          });
        }
      }),
    );

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

// ------------------ GET ALL ---------------------
export const getAllSections: RequestHandler = async (req, res) => {
  try {
    const sections = await Section.find();
    if (!sections) {
      return handleError(res, "Sections not found", 404);
    }
    res.json(sections);
  } catch (error: unknown) {
    handleError(res, error instanceof Error ? error.message : "Unknown error");
  }
};
