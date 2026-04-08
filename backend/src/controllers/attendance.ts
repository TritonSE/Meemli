import { validationResult } from "express-validator";
import { Types } from "mongoose";

import { AttendanceModel } from "../models/attendance";
import { Section } from "../models/sections";
import { SessionModel } from "../models/session";

import type { RequestHandler } from "express";

type CreateAttendanceBody = {
  session: string;
  student: string;
  status: "LATE" | "ABSENT" | "PRESENT";
  notes?: string;
};

export const createAttendance: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(errors.array()[0].msg as string);
    const { session, student, status, notes } = req.body as CreateAttendanceBody;

    const attendance = await AttendanceModel.create({
      session,
      student,
      status,
      notes,
    });

    return res.status(201).json(attendance);
  } catch (error) {
    next(error);
  }
};

type UpdateAttendanceBody = Partial<CreateAttendanceBody>;

export const updateAttendanceById: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(errors.array()[0].msg as string);
    const { id } = req.params;
    const updateData: UpdateAttendanceBody = req.body as UpdateAttendanceBody;
    const updatedAttendance = await AttendanceModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    // updatedAttendance will be null if no attendance with the given ID was found
    if (!updatedAttendance) {
      return res.status(404).json({ error: "Attendance record not found" });
    }

    return res.status(200).json(updatedAttendance);
  } catch (error) {
    next(error);
  }
};

const getStudentsInSection = async (sectionId: Types.ObjectId): Promise<Types.ObjectId[]> => {
  const section = await Section.findById(sectionId).select("enrolledStudents");

  // Can't be null because of validation checks prior to calling this function
  return section!.enrolledStudents;
};

export const ensureAttendanceForSession = async (sessionId: string) => {
  const existing = await AttendanceModel.find({ session: sessionId });
  if (existing.length > 0) return existing;

  const session = await SessionModel.findById(sessionId);
  if (!session) throw new Error("Session not found");

  const sessionDate = new Date(session.sessionDate);
  const today = new Date();
  sessionDate.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  // Don't create attendance for future sessions
  if (sessionDate > today) return [];

  const students = await getStudentsInSection(session.section);
  await Promise.all(
    students.map(async (studentId) =>
      AttendanceModel.create({ session: session._id, student: studentId, status: "PRESENT" }),
    ),
  );

  return AttendanceModel.find({ session: sessionId });
};

export const getAttendanceBySessionId: RequestHandler = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) throw new Error(errors.array()[0].msg as string);
    const { sessionId } = req.params;
    const attendance = await AttendanceModel.find({ session: sessionId });
    // Throw an error if no attendance records are found for the session
    if (attendance.length === 0) {
      return res.status(404).json({ error: "Attendance records not found" });
    }
    return res.status(200).json(attendance);
  } catch (error) {
    next(error);
  }
};

type AttendanceUpdate = {
  attendanceId: string;
  status: "PRESENT" | "LATE" | "ABSENT";
  notes: string;
};

export const updateBulkAttendance: RequestHandler = async (req, res, next) => {
  try {
    const updates = req.body as unknown;

    // 1. Safety Check: Is it an array?
    if (!Array.isArray(updates)) {
      return res.status(400).json({ error: "Expected an array of updates" });
    }

    // filter out any items missing an 'attendanceId' to prevent crashes
    const operations = (updates as AttendanceUpdate[])
      .filter((u) => u.attendanceId)
      .map((update) => ({
        updateOne: {
          filter: { _id: new Types.ObjectId(update.attendanceId) },
          update: {
            status: update.status,
            notes: update.notes,
          },
        },
      }));

    // 3. Execute the updates
    if (operations.length > 0) {
      await AttendanceModel.bulkWrite(operations);
    }

    res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    next(error);
  }
};
