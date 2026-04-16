import { validationResult } from "express-validator";
import createHttpError from "http-errors";

import { AttendanceModel } from "../models/attendance";
import { SessionModel } from "../models/session";
import { Section } from "../models/sections";

import { ensureAttendanceForSession } from "./attendance";

import type { RequestHandler } from "express";
import type { Types } from "mongoose";

type CreateSessionBody = {
  section: string;
  sessionDate: string;
};

export const createSession: RequestHandler = async (req, res, next) => {
  try {
    if (!req.userContext?.admin) {
      throw new createHttpError.Forbidden("Admin privileges required to create session");
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(errors.array()[0].msg as string);
    const { section, sessionDate } = req.body as CreateSessionBody;

    const session = await SessionModel.create({
      section,
      sessionDate,
    });

    return res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

type UpdateSessionBody = Partial<{
  section: string;
  sessionDate: string;
}>;

export const editSessionById: RequestHandler = async (req, res, next) => {
  try {
    if (!req.userContext?.admin) {
      throw new createHttpError.Forbidden("Admin privileges required to edit session");
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(errors.array()[0].msg as string);
    const { id } = req.params;
    const updateData: UpdateSessionBody = req.body as UpdateSessionBody;
    const updatedSession = await SessionModel.findByIdAndUpdate(id, updateData, { new: true });

    // updatedSession will be null if no session with the given ID was found
    if (!updatedSession) {
      return res.status(404).json({ error: "Session not found" });
    }

    return res.status(200).json(updatedSession);
  } catch (error) {
    next(error);
  }
};

export const getSession: RequestHandler = async (req, res, next) => {
  const { id } = req.params;

  try {
    const session = await SessionModel.findById(id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }

    // Non-admins can only view sessions for sections they teach
    if (!req.userContext?.admin) {
      const section = await Section.findById(session.section);
      if (!section || !section.teachers.includes(req.userId!)) {
        throw new createHttpError.Forbidden("You do not have permission to view this session");
      }
    }

    const attendanceRecords = await ensureAttendanceForSession(id);
    const populated = await AttendanceModel.populate(attendanceRecords, { path: "student" });

    res.status(200).json({ ...session.toObject(), attendees: populated });
  } catch (error) {
    next(error);
  }
};

// Returns all Sessions under a specific Section ID
export const getSessionsBySectionId: RequestHandler = async (req, res, next) => {
  const { sectionId } = req.params;

  try {
    if (!req.userContext?.admin) {
      const section = await Section.findById(sectionId);
      if (!section || !section.teachers.includes(req.userId!)) {
        throw new createHttpError.Forbidden("You do not have permission to view sessions for this section");
      }
    }

    const sessions = await SessionModel.find({ section: sectionId });
    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
};

export const getAllSessions: RequestHandler = async (req, res, next) => {
  try {
    // Admins: return all sessions
    if (req.userContext?.admin) {
      const sessions = await SessionModel.find().populate("section");
      return res.status(200).json(sessions);
    }

    // Non-admins: find only sections they teach, then return sessions for those
    const assignedSections = await Section.find({ teachers: req.userId });
    const assignedSectionIds = assignedSections.map((s: { _id: Types.ObjectId }) => s._id);

    const sessions = await SessionModel.find({ section: { $in: assignedSectionIds } }).populate(
      "section",
    );
    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
};
