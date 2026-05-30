import createHTTPError from "http-errors";
import { Types } from "mongoose";

import { AttendanceModel } from "../models/attendance";
import { Section } from "../models/sections";
import { SessionModel } from "../models/session";
import StudentModel from "../models/student";

import type { RequestHandler } from "express";

const createHttpError = createHTTPError;

type CreateAttendanceBody = {
  session: string;
  student: string;
  status: "LATE" | "ABSENT" | "PRESENT";
  notes?: string;
};

export const createAttendance: RequestHandler = async (req, res, next) => {
  try {
    if (!req.userContext?.admin)
      throw new createHttpError.Forbidden("Admin privileges required to create attendance record");

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
    const { id } = req.params;

    const attendance = await AttendanceModel.findById(id);
    if (!attendance) throw new createHttpError.NotFound("Attendance record not found");

    if (!req.userContext?.admin) {
      const session = await SessionModel.findById(attendance.session);
      const isTeacher = (req.userContext?.assignedSections ?? []).some(
        (sectionId) => sectionId.toString() === session?.section.toString(),
      );
      if (!isTeacher) {
        throw new createHttpError.Forbidden("You are not the teacher of this section");
      }
    }

    const updateData: UpdateAttendanceBody = req.body as UpdateAttendanceBody;
    const updatedAttendance = await AttendanceModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    // updatedAttendance will be null if no attendance with the given ID was found
    if (!updatedAttendance) {
      throw createHTTPError(404, "Attendance record not found");
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
  if (!session) throw createHTTPError(404, "Session not found");

  const sessionDate = new Date(session.sessionDate);
  const now = new Date();

  // Include today: only skip future sessions
  const isCurrentOrPast = sessionDate <= now;
  if (!isCurrentOrPast) return [];

  const students = await getStudentsInSection(new Types.ObjectId(session.section.toString()));

  await Promise.all(
    students.map(async (studentId) =>
      AttendanceModel.create({
        session: session._id,
        student: studentId,
      }),
    ),
  );

  return AttendanceModel.find({ session: sessionId });
};

export const getAttendanceBySessionId: RequestHandler = async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    if (!req.userContext?.admin) {
      const session = await SessionModel.findById(sessionId);
      const isTeacher = (req.userContext?.assignedSections ?? []).some(
        (id) => id.toString() === session?.section.toString(),
      );

      if (!isTeacher) {
        throw new createHttpError.Forbidden();
      }
    }

    const attendance = await AttendanceModel.find({ session: sessionId });
    // Throw an error if no attendance records are found for the session
    if (attendance.length === 0) {
      throw createHTTPError(404, "Attendance records not found");
    }
    return res.status(200).json(attendance);
  } catch (error) {
    next(error);
  }
};

export const getAttendanceByStudentId: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  try {
    if (!Types.ObjectId.isValid(id)) {
      throw createHTTPError(400, "Invalid student ID");
    }
    const student = await StudentModel.findById(id);
    if (!req.userContext?.admin) {
      // extract the teacher's assigned sections that have the student enrolled
      const sectionsWithStudent = (req.userContext?.assignedSections ?? []).filter((sectionId) =>
        student?.enrolledSections.some((enrolledId) => enrolledId.equals(sectionId)),
      );
      // teacher does not teach this student
      if (sectionsWithStudent.length === 0) {
        throw createHTTPError.Forbidden();
      }
      const sessionIds = await SessionModel.find({
        section: { $in: sectionsWithStudent },
      }).distinct("_id");

      const attendance = await AttendanceModel.find({
        session: { $in: sessionIds },
        student: id,
      });
      if (attendance.length === 0) {
        throw createHTTPError(404, "Attendance records not found");
      }
      return res.status(200).json(attendance);
    } else {
      const attendance = await AttendanceModel.find({ student: id });
      if (attendance.length === 0) {
        throw createHTTPError(404, "Attendance records not found");
      }
      return res.status(200).json(attendance);
    }
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
      throw createHTTPError(400, "Request body must be an array of attendance updates");
    }

    if (!req.userContext?.admin) {
      const attendanceIds = (updates as AttendanceUpdate[]).map((u) => u.attendanceId);
      const records = await AttendanceModel.find({ _id: { $in: attendanceIds } });
      const sessionIds = [...new Set(records.map((r) => r.session.toString()))];
      const sessions = await SessionModel.find({ _id: { $in: sessionIds } });
      const sectionIds = sessions.map((s) => s.section.toString());

      const teacherSectionIds = new Set(
        (req.userContext?.assignedSections ?? []).map((id) => id.toString()),
      );

      const isAuthorized = sectionIds.every((id) => teacherSectionIds.has(id));
      if (!isAuthorized) throw new createHttpError.Forbidden();
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

    if (operations.length > 0) {
      await AttendanceModel.bulkWrite(operations);
    }

    res.status(200).json({ message: "Attendance updated successfully" });
  } catch (error) {
    next(error);
  }
};
