import createHTTPError from "http-errors";
import { Types } from "mongoose";

import {
  hasStudentAccess,
  TEACHER_EDITABLE_STUDENT_FIELDS,
  TEACHER_STUDENT_PROJECTION,
} from "../middleware/permissions";
import StudentModel from "../models/student";

import type { RequestHandler } from "express";

// Create Student Body
type CreateStudentBody = {
  parentContact: {
    firstName: string;
    lastName: string;
    phoneNumber: string;
    email: string;
  };
  displayName: string;
  meemliEmail: string;
  grade: number;
  schoolName: string;
  city: string;
  state: string;
  preassessmentScore: number;
  postassessmentScore: number;
  enrolledSections: string[];
  comments: string;
};

// Create Student — admin only (enforced in route middleware)
export const createStudent: RequestHandler = async (req, res, next) => {
  const { enrolledSections, ...studentData } = req.body as CreateStudentBody;
  const enrolledSectionsIds = enrolledSections.map((section) => new Types.ObjectId(section));

  try {
    const student = await StudentModel.create({
      ...studentData,
      enrolledSections: enrolledSectionsIds,
      archived: false,
    });

    const populatedStudent = await student.populate("enrolledSections");
    res.status(201).json(populatedStudent);
  } catch (error) {
    return next(error);
  }
};

// Get All Students
// Admins: all students
// Teachers: only students enrolled in one of their sections
export const getAllStudents: RequestHandler = async (req, res, next) => {
  try {
    if (!req.userContext?.admin) {
      const teacherSectionIds = (req.userContext?.assignedSections ?? []).map((id) =>
        id.toString(),
      );
      const students = await StudentModel.find(
        { enrolledSections: { $in: teacherSectionIds } },
        TEACHER_STUDENT_PROJECTION,
      );

      // Filter enrolledSections to only show what this teacher teaches
      const filteredStudents = students.map((student) => {
        const studentObj = student.toObject();
        studentObj.enrolledSections = (studentObj.enrolledSections ?? []).filter(
          (id: Types.ObjectId) => teacherSectionIds.includes(id.toString()),
        );
        return studentObj;
      });

      return res.status(200).json(filteredStudents);
    }
    const students = await StudentModel.find();
    res.status(200).json(students);
  } catch (error) {
    return next(error);
  }
};

// Get by ID
// Admins: any student
// Teachers: only students enrolled in one of their sections
export const getStudentById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    throw createHTTPError(400, "Invalid student ID");
  }

  try {
    const isAdmin = req.userContext?.admin ?? false;
    const student = await StudentModel.findById(id).populate("enrolledSections");
    if (!student) {
      throw createHTTPError(404, "Student not found");
    }

    if (req.userContext && !hasStudentAccess(req.userContext, student.enrolledSections)) {
      throw createHTTPError(403, "Forbidden");
    }

    if (!isAdmin) {
      const studentObj = student.toObject();
      const teacherSectionIds = new Set(
        (req.userContext?.assignedSections ?? []).map((sid) => sid.toString()),
      );

      return res.status(200).json({
        _id: studentObj._id,
        displayName: studentObj.displayName,
        grade: studentObj.grade,
        preassessmentScore: studentObj.preassessmentScore,
        postassessmentScore: studentObj.postassessmentScore,
        comments: studentObj.comments,
        archived: studentObj.archived,
        enrolledSections: (
          (studentObj.enrolledSections ?? []) as { _id?: Types.ObjectId }[]
        ).filter((s) => teacherSectionIds.has(s._id?.toString() || s.toString())),
      });
    }

    res.status(200).json(student);
  } catch (error) {
    return next(error);
  }
};

// Edit by ID
// Admins: any student, any fields
// Teachers: only students in their sections; only comments, preassessmentScore, postassessmentScore
type EditStudentBody = Partial<CreateStudentBody>;

export const editStudentById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    throw createHTTPError(400, "Invalid student ID");
  }

  let updates: EditStudentBody = req.body as EditStudentBody;

  try {
    if (!req.userContext?.admin) {
      const student = await StudentModel.findById(id);
      if (!student) {
        return res.status(404).json({ message: "Student not found" });
      }

      if (req.userContext && !hasStudentAccess(req.userContext, student.enrolledSections)) {
        throw createHTTPError(403, "Forbidden");
      }

      updates = Object.fromEntries(
        Object.entries(updates).filter(([key]) => TEACHER_EDITABLE_STUDENT_FIELDS.has(key)),
      ) as EditStudentBody;
    }

    const student = await StudentModel.findByIdAndUpdate(id, updates, { new: true }).populate(
      "enrolledSections",
    );
    if (!student) {
      throw createHTTPError(404, "Student not found");
    }

    if (!req.userContext?.admin) {
      const studentObj = student.toObject();
      const teacherSectionIds = new Set(
        (req.userContext?.assignedSections ?? []).map((sid) => sid.toString()),
      );

      return res.status(200).json({
        _id: studentObj._id,
        displayName: studentObj.displayName,
        grade: studentObj.grade,
        preassessmentScore: studentObj.preassessmentScore,
        postassessmentScore: studentObj.postassessmentScore,
        comments: studentObj.comments,
        archived: studentObj.archived,
        enrolledSections: (
          (studentObj.enrolledSections ?? []) as { _id?: Types.ObjectId }[]
        ).filter((s) => teacherSectionIds.has(s._id?.toString() || s.toString())),
      });
    }

    res.status(200).json(student);
  } catch (error) {
    return next(error);
  }
};

// Mass edits so there arent a bunch of separate requests
export const archiveStudentsByIds: RequestHandler = async (req, res, next) => {
  const { ids, flag } = req.body as { ids: string[]; flag: boolean };
  const validIds = ids
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));
  if (validIds.length === 0) {
    throw createHTTPError(400, "No valid student IDs provided");
  }

  try {
    await StudentModel.updateMany({ _id: { $in: validIds } }, { $set: { archived: flag } });
    res.status(200).json({ message: `Students ${flag ? "archived" : "unarchived"} successfully` });
  } catch (error) {
    return next(error);
  }
};

// Delete by ID
export const deleteStudentById: RequestHandler = async (req, res, next) => {
  const { id } = req.params;
  if (!Types.ObjectId.isValid(id)) {
    throw createHTTPError(400, "Invalid student ID");
  }

  try {
    const student = await StudentModel.findByIdAndDelete(id);
    if (!student) {
      throw createHTTPError(404, "Student not found");
    }
    res.status(200).json({ message: "Student deleted successfully" });
  } catch (error) {
    return next(error);
  }
};

export const deleteStudentsByIds: RequestHandler = async (req, res, next) => {
  const { ids } = req.body as { ids: string[] };
  const validIds = ids
    .filter((id) => Types.ObjectId.isValid(id))
    .map((id) => new Types.ObjectId(id));
  if (validIds.length === 0) {
    throw createHTTPError(400, "No valid student IDs provided");
  }
  try {
    await StudentModel.deleteMany({ _id: { $in: validIds } });
    res.status(200).json({ message: "Students deleted successfully" });
  } catch (error) {
    return next(error);
  }
};
