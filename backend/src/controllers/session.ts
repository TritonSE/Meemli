import createHTTPError from "http-errors";

import { AttendanceModel } from "../models/attendance";
import { Section } from "../models/sections";
import { SessionModel } from "../models/session";

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
      throw createHTTPError(403, "Admin privileges required to create session");
    }

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
      throw createHTTPError(403, "Admin privileges required to edit session");
    }

    const { id } = req.params;
    const updateData: UpdateSessionBody = req.body as UpdateSessionBody;
    const updatedSession = await SessionModel.findByIdAndUpdate(id, updateData, { new: true });

    // updatedSession will be null if no session with the given ID was found
    if (!updatedSession) {
      throw createHTTPError(404, "Session not found");
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
      throw createHTTPError(404, "Session not found");
    }

    // Non-admins can only view sessions for sections they teach
    if (!req.userContext?.admin) {
      const section = await Section.findById(session.section);
      if (!section || !section.teachers.includes(req.userId!)) {
        throw createHTTPError(403, "You do not have permission to view this session");
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
        throw createHTTPError(403, "You do not have permission to view sessions for this section");
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
