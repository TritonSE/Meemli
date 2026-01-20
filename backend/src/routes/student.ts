import express from "express";

import * as StudentController from "../controllers/student";
import * as StudentValidator from "../validators/student";

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
    "comments": ""
}
*/

// Get Student by ID
router.get("/:id", StudentController.getStudentById);

// Create Student
router.post("/", StudentValidator.validateCreateStudent, StudentController.createStudent);

// Edit Student by ID
router.put("/:id", StudentValidator.validateEditStudent, StudentController.editStudentById);

// Delete Student by ID
router.delete("/:id", StudentController.deleteStudentById);

export default router;
