import SessionModel from "../models/session";

import type { RequestHandler } from "express";

type CreateSessionBody = {
  section: string;
  sessionDate: Date;
  attendees: string[];
};

export const createSession: RequestHandler = async (req, res, next) => {
  const { section, sessionDate, attendees } = req.body as CreateSessionBody;

  try {
    const session = new SessionModel({ section, sessionDate, attendees });

    await session.save();

    return res.status(201).json(session);
  } catch (error) {
    next(error);
  }
};

export const editSessionById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const updatedSession = await SessionModel.findByIdAndUpdate(id, updateData, { new: true });

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
