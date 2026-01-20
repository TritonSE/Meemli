import express from "express";

import * as StudentsController from "../controllers/students";
import * as StudentsValidator from "../validators/students";

const router = express.Router();

/* For Testing Purposes:
{
    "parentContact" : {
        "firstName": "XYZ",
        "lastName": "Desai",
        "phoneNumber": 3322549710,
        "email": "himirdesai72@gmail.com"
    },
    "displayName": "Himir Desai",
    "meemliEmail": "h1desai@ucsd.edu",
    "grade": 11,
    "schoolName": "UCSD",
    "city": "San Diego",
    "state": "California",
    "preassessmentScore": 87,
    "postassessmentScore": 94,
    "enrolledSections": [],
    "comments": "Some comments heres"
}
*/

// Get All Students
router.get("/", StudentsController.getAllStudents);

// Get Student by ID
router.get("/:id", StudentsController.getStudentById);

// Create Student
router.post("/", StudentsValidator.validateCreateStudent, StudentsController.createStudent);

// Edit Student by ID
router.put("/:id", StudentsValidator.validateEditStudent, StudentsController.editStudentById);

// Delete Student by ID
router.delete("/:id", StudentsController.deleteStudentById);

export default router;
