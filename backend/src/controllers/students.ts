import createHTTPError from "http-errors";
import { Types } from "mongoose";

import StudentModel from "../models/student";
import { Section } from "../models/sections";
import {
  hasStudentAccess,
  TEACHER_EDITABLE_STUDENT_FIELDS,
  TEACHER_STUDENT_PROJECTION,
} from "../middleware/permissions";

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
      const teacherSections = await Section.find({ teachers: req.userContext?._id }, "_id");
      const teacherSectionIds = teacherSections.map((s) => s._id);
      const students = await StudentModel.find(
        { enrolledSections: { $in: teacherSectionIds } },
        TEACHER_STUDENT_PROJECTION,
      );
      return res.status(200).json(students);
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

    if (req.userContext && !(await hasStudentAccess(req.userContext, student.enrolledSections))) {
      throw createHTTPError(403, "Forbidden");
    }

    if (!isAdmin) {
      const { _id, displayName, grade, preassessmentScore, postassessmentScore, comments } =
        student.toObject();
      return res.status(200).json({ _id, displayName, grade, preassessmentScore, postassessmentScore, comments });
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

      if (req.userContext && !(await hasStudentAccess(req.userContext, student.enrolledSections))) {
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
      return res.status(404).json({ message: "Student not found" });
    }

    if (!req.userContext?.admin) {
      const { _id, displayName, grade, preassessmentScore, postassessmentScore, comments } =
        student.toObject();
      return res.status(200).json({ _id, displayName, grade, preassessmentScore, postassessmentScore, comments });
    }

    res.status(200).json(student);
  } catch (error) {
    return next(error);
  }
};

// Delete by ID — admin only (enforced in route middleware)
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
