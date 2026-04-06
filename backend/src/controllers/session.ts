import createHTTPError from "http-errors";

import { AttendanceModel } from "../models/attendance";
import { SessionModel } from "../models/session";

import { ensureAttendanceForSession } from "./attendance";

import type { RequestHandler } from "express";

type CreateSessionBody = {
  section: string;
  sessionDate: string;
};

export const createSession: RequestHandler = async (req, res, next) => {
  try {
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
    //Get the Session Info (Date, Section)
    const session = await SessionModel.findById(id);

    if (!session) {
      throw createHTTPError(404, "Session not found");
    }

    // This creates records if missing, checks the date, returns them
    const attendanceRecords = await ensureAttendanceForSession(id);
    const populated = await AttendanceModel.populate(attendanceRecords, { path: "student" });

    const response = {
      ...session.toObject(),
      attendees: populated,
    };

    res.status(200).json(response);
  } catch (error) {
    next(error);
  }
};

// Returns all Sessions under a specific Section ID
export const getSessionsBySectionId: RequestHandler = async (req, res, next) => {
  const { sectionId } = req.params;

  try {
    const sessions = await SessionModel.find({ section: sectionId });

    // No population of attendance records needed

    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
};

export const getAllSessions: RequestHandler = async (req, res, next) => {
  try {
    const sessions = await SessionModel.find().populate("section");

    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
};
