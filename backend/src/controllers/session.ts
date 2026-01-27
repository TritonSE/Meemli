import { validationResult } from "express-validator";

import { SessionModel } from "../models/session";

import type { RequestHandler } from "express";
import type { Types } from "mongoose";

type CreateSessionBody = {
  section: string;
  sessionDate: string;
};

export const createSession: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(errors.array()[0].msg as string);
    const { section, sessionDate} = req.body as CreateSessionBody;

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
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(errors.array()[0].msg as string);
    const { id } = req.params;
    const session = await SessionModel.findById(id);
    if (!session) {
      return res.status(404).json({ error: "Session not found" });
    }
    res.status(200).json(session);
  } catch (error) {
    next(error);
  }
};
