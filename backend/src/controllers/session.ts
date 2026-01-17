import { Types } from "mongoose";

import { SessionModel } from "../models/session";

import type { RequestHandler } from "express";

type CreateSessionBody = {
  section: string;
  sessionDate: string;
  attendees: string[];
};

export const createSession: RequestHandler = async (req, res, next) => {
  const { section, sessionDate, attendees } = req.body as CreateSessionBody;

  try {
    // Extra checks since we create new objects later (Mongoose would create if doesn't exist)
    if (!section) {
      return res.status(400).json({ error: "section is required" });
    }
    if (!sessionDate) {
      return res.status(400).json({ error: "sessionDate is required" });
    }

    const session = await SessionModel.create({
      section: new Types.ObjectId(section),
      sessionDate: new Date(sessionDate),
      attendees: attendees.map((id) => new Types.ObjectId(id)),
    });

    return res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

type UpdateSessionBody = Partial<{
  section: string;
  sessionDate: string;
  attendees: string[];
}>;

export const editSessionById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const updateData: UpdateSessionBody = req.body as UpdateSessionBody;

  try {
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
    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
};
