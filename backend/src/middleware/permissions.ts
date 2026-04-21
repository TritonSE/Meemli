import { Types } from "mongoose";

import { Section } from "../models/sections";

import type { SectionDoc } from "../models/sections";
import type { UserContext } from "../types/express";

/**
 * Returns true if the user is an admin or is listed as a teacher of the section.
 */
export const hasSectionAccess = (userContext: UserContext, section: SectionDoc): boolean =>
  userContext.admin || section.teachers.includes(userContext._id);

/**
 * Returns true if the user is an admin or the student is enrolled in at least
 * one section that the user teaches.
 */
export const hasStudentAccess = async (
  userContext: UserContext,
  studentEnrolledSections: Types.ObjectId[],
): Promise<boolean> => {
  if (userContext.admin) return true;
  const teacherSections = await Section.find({ teachers: userContext._id }, "_id");
  const teacherSectionIds = new Set(teacherSections.map((s) => s._id.toString()));
  return studentEnrolledSections.some((s) => teacherSectionIds.has(s.toString()));
};

/**
 * Fields a non-admin user (teacher) is allowed to modify on a student record.
 */
export const TEACHER_EDITABLE_STUDENT_FIELDS = new Set([
  "comments",
  "preassessmentScore",
  "postassessmentScore",
]);

/**
 * Mongoose projection string for non-admin (teacher) reads: only these fields
 * are returned on student documents.
 */
export const TEACHER_STUDENT_PROJECTION =
  "displayName grade preassessmentScore postassessmentScore comments";
