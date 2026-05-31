import { Button } from "../Button";

import styles from "./EmailTemplate.module.css";

import type { Section } from "@/src/api/sections";
import type { Student } from "@/src/api/students";
import type { User } from "@/src/api/user";

import { useAuth } from "@/src/context/AuthContext";

export function EmailTemplate({
  student,
  sections,
  teachers,
}: {
  student: Student;
  sections: Section[];
  teachers: User[];
}) {
  const { isAdmin, user } = useAuth();
  if (!isAdmin) return <></>;

  const to12Hour = (time24: string): string => {
    const [hh, mm] = time24.split(":").map(Number);

    const period = hh >= 12 ? "PM" : "AM";
    const hour12 = hh % 12 === 0 ? 12 : hh % 12;

    return `${hour12}:${mm.toString().padStart(2, "0")} ${period}`;
  };

  function generateString(sectionId: string) {
    const section = sections.find((s) => s._id === sectionId);
    if (!section) return "";

    return `
      * ${section.code}
        Instructor: ${section.teachers
          .map((teacherId) => {
            const teacher = teachers.find((t) => t._id === teacherId);
            return teacher ? `${teacher.firstName} ${teacher.lastName}` : null;
          })
          .filter(Boolean)
          .join(", ")}
        Days: ${section.days.join(", ")}
        Time: ${to12Hour(section.startTime)} - ${to12Hour(section.endTime)}
        `;
  }

  const emailText = `Dear ${student.parentContact?.firstName} ${student.parentContact?.lastName},

We hope this message finds you well.

We are writing to provide you with an overview of ${student.displayName}'s current schedule at Meemli. Below you will find details regarding their enrolled courses, meeting times, and our contact information.

Student Information
Name: ${student.displayName}
Student Email: ${student.meemliEmail}

Enrolled Courses and Schedule
${student.enrolledSections?.map((id) => generateString(id)).join("")}

Contact Information
If you have any questions or need further assistance, please feel free to reach out:
Email: ${user?.meemliEmail}
Phone: ${user?.phoneNumber}

We appreciate your support and involvement in ${student.displayName}'s learning journey. Please don't hesitate to contact us if there's anything we can help with.

Sincerely,
Meemli Team`;

  const copyEmail = async () => {
    await navigator.clipboard.writeText(emailText);
  };

  function generateHTML(sectionId: string) {
    const section = sections.find((s) => s._id === sectionId);
    if (!section) return <></>;

    const instructors = section.teachers
      .map((teacherId) => {
        const teacher = teachers.find((t) => t._id === teacherId);
        return teacher ? `${teacher.firstName} ${teacher.lastName}` : null;
      })
      .filter(Boolean)
      .join(", ");

    return (
      <li key={sectionId}>
        <strong>{section.code}</strong>
        <div>Instructor: {instructors}</div>
        <div>Days: {section.days.join(", ")}</div>
        <div>
          Time: {section.startTime} - {section.endTime}
        </div>
      </li>
    );
  }

  return (
    <div className={styles.templateWrapper}>
      <p>
        Dear {student.parentContact?.firstName} {student.parentContact?.lastName},
      </p>
      <p></p>
      <p>We hope this message finds you well.</p>
      <p></p>
      <p>
        We are writing to provide you with an overview of {student.displayName}'s current schedule
        at Meemli. Below you will find details regarding their enrolled courses, meeting times, and
        our contact information.
      </p>
      <h2>Student Information</h2>
      <p>Name: {student.displayName}</p>
      <p>Student Email: {student.meemliEmail}</p>
      <p></p>
      <h2>Enrolled Courses and Schedule</h2>
      <p></p>
      <ul>{student.enrolledSections?.map((sectionId) => generateHTML(sectionId))}</ul>
      <p></p>
      <h2>Contact Information</h2>
      <p>If you have any questions or need further assistance, please feel free to reach out:</p>
      <p>Email: {user?.meemliEmail}</p>
      <p>Phone: {user?.phoneNumber}</p>
      <p></p>
      <p>
        We appreciate your support and involvement in {student.displayName}'s learning journey.
        Please don't hesitate to contact us if there's anything we can help with.
      </p>
      <p></p>
      <p>Sincerely,</p>
      <p>Meemli Team</p>
      <div className={styles.buttonBar}>
        <Button
          className={styles.button}
          kind="primary"
          label="Copy to Clipboard"
          onClick={() => void copyEmail()}
        />
      </div>
    </div>
  );
}
