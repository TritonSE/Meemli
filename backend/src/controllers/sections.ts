import { Types } from "mongoose";

import { AttendanceModel } from "../models/attendance";
import { Section } from "../models/sections";
import { SessionModel } from "../models/session";
import StudentModel from "../models/student";
import { handleEnrollment, handleUnenrollment } from "../util/attendanceLogic";

import type { SectionDoc } from "../models/sections";
// controllers/sections.ts
import type { RequestHandler, Response } from "express";
import type mongoose from "mongoose";

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
  "code" | "program" | "teachers" | "enrolledStudents" | "startTime" | "endTime" | "days"
>;

// ---------------------- UPDATE ----------------------
export const updateSection: RequestHandler<{ id: string }, unknown, UpdateSectionBody> = async (
  req,
  res,
) => {
  try {
    // Fetch BEFORE update so we can diff enrolledStudents
    const existingSection = await Section.findById(req.params.id);
    if (!existingSection) {
      return handleError(res, `Section ${req.params.id} not found`, 404);
    }

    const section = await Section.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true },
    );

    if (!section) {
      return handleError(res, `Section ${req.params.id} not found`, 404);
    }

    if (req.body.enrolledStudents) {
      const oldStudentIds = existingSection.enrolledStudents.map((s) => s.toString());
      const newStudentIds = req.body.enrolledStudents.map((s) => s.toString());

      const added = newStudentIds.filter((s) => !oldStudentIds.includes(s));
      const removed = oldStudentIds.filter((s) => !newStudentIds.includes(s));

      if (added.length > 0) {
        await Promise.all(
          added.map(async (studentId) => handleEnrollment(studentId, req.params.id)),
        );
      }
      if (removed.length > 0) {
        await Promise.all(
          removed.map(async (studentId) => handleUnenrollment(studentId, req.params.id)),
        );
      }
    }

    res.json(section);
  } catch (error: unknown) {
    handleError(res, error instanceof Error ? error.message : "Unknown error");
  }
};

// ---------------------- DELETE ----------------------
export const handleSectionDeletion = async (
  sectionId: string | mongoose.Types.ObjectId,
): Promise<void> => {
  const sId = new Types.ObjectId(sectionId.toString());

  // Remove section from all students' enrolledSections
  await StudentModel.updateMany({ enrolledSections: sId }, { $pull: { enrolledSections: sId } });

  // Get all sessions for this section
  const sessions = await SessionModel.find({ section: sId });
  const now = new Date();

  // Delete attendance only for future sessions
  const futureSessionIds = sessions.filter((s) => s.sessionDate > now).map((s) => s._id);

  await AttendanceModel.deleteMany({ session: { $in: futureSessionIds } });

  // Delete all sessions for this section
  await SessionModel.deleteMany({ section: sId });
};

export const deleteSection: RequestHandler<{ id: string }> = async (req, res) => {
  try {
    await handleSectionDeletion(req.params.id);

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
