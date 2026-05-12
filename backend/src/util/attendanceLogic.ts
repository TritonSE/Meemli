import { Types } from "mongoose";

import { AttendanceModel } from "../models/attendance";
import { Section } from "../models/sections";
import { SessionModel } from "../models/session";

import type mongoose from "mongoose";

export const handleEnrollment = async (
  studentId: string | Types.ObjectId,
  sectionId: string | Types.ObjectId,
): Promise<void> => {
  const sId = new Types.ObjectId(sectionId.toString());
  const studId = new Types.ObjectId(studentId.toString());

  // Add student to Section's enrolledStudents (no-op if already present)
  await Section.findByIdAndUpdate(sId, { $addToSet: { enrolledStudents: studId } });

  const enrollmentDate = new Date();
  const sessions = await SessionModel.find({
    section: sId,
    sessionDate: { $lte: enrollmentDate },
  });

  if (sessions.length === 0) return;

  await Promise.all(
    sessions.map((session) =>
      AttendanceModel.findOneAndUpdate(
        { student: studId, session: session._id },
        {
          $setOnInsert: {
            student: studId,
            session: session._id,
            status: "ABSENT",
            notes: "Late enrollment sync",
          },
        },
        { upsert: true, new: true },
      ),
    ),
  );
};

export const handleUnenrollment = async (
  studentId: string | mongoose.Types.ObjectId,
  sectionId: string | mongoose.Types.ObjectId,
): Promise<void> => {
  const now = new Date();
  const sId = new Types.ObjectId(sectionId.toString());
  const studId = new Types.ObjectId(studentId.toString());

  // Remove student from Section's enrolledStudents
  await Section.findByIdAndUpdate(sId, { $pull: { enrolledStudents: studId } });

  const futureSessions = await SessionModel.find({
    section: sId,
    sessionDate: { $gt: now },
  });

  const futureSessionIds = futureSessions.map((s) => s._id);

  await AttendanceModel.deleteMany({
    student: studId,
    session: { $in: futureSessionIds },
  });
};

export const handleFullDeletion = async (
  studentId: string | mongoose.Types.ObjectId,
): Promise<void> => {
  // Update all sections to pull the student
  await Section.updateMany(
    { enrolledStudents: studentId },
    { $pull: { enrolledStudents: studentId } },
  );

  // Wipe all attendance for this student
  await AttendanceModel.deleteMany({ student: studentId });
};
