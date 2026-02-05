import { useEffect, useState } from "react";

import { getAllStudents } from "../api/students";
import { Page } from "../components/Page";
import { StudentForm } from "../components/studentform/StudentForm";

import type { Student } from "../api/students";

export function TestStudentForm() {
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isLoading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    getAllStudents()
      .then((result) => {
        if (result.success) {
          setStudents(result.data);
          setSelectedId(result.data[0]?._id ?? null);
        } else {
          setErrorMessage(result.error);
        }
      })
      .catch((error) => setErrorMessage(error instanceof Error ? error.message : String(error)))
      .finally(() => setLoading(false));
  }, []);

  const selectedStudent = students.find((student) => student._id === selectedId) ?? null;

  return (
    <Page>
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <section>
          <h1>StudentForm</h1>
          <StudentForm
            mode="create"
            onSubmit={() => {
              setLoading(true);
              getAllStudents()
                .then((result) => {
                  if (result.success) {
                    setStudents(result.data);
                  } else {
                    setErrorMessage(result.error);
                  }
                })
                .catch((error) =>
                  setErrorMessage(error instanceof Error ? error.message : String(error)),
                )
                .finally(() => setLoading(false));
            }}
          />
        </section>

        <section>
          <h2>Edit student</h2>
          {isLoading && <p>Loading students...</p>}
          {errorMessage && <p>Error : {errorMessage}</p>}
          {!isLoading && !errorMessage && students.length === 0 && <p>No students found.</p>}
          {students.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {students.map((student) => (
                <button
                  key={student._id}
                  onClick={() => setSelectedId(student._id)}
                  type="button"
                  style={{
                    padding: "0.5rem 0.9rem",
                    borderRadius: "8px",
                    border: "1px solid #cbd5f5",
                    background: student._id === selectedId ? "#1d4ed8" : "#ffffff",
                    color: student._id === selectedId ? "#ffffff" : "#1e293b",
                    cursor: "pointer",
                  }}
                >
                  Edit {student.displayName}
                </button>
              ))}
            </div>
          )}
          {selectedStudent && (
            <div style={{ marginTop: "1.5rem" }}>
              <StudentForm
                mode="edit"
                student={selectedStudent}
                key={selectedStudent._id}
                onSubmit={() => {
                  setLoading(true);
                  getAllStudents()
                    .then((result) => {
                      if (result.success) setStudents(result.data);
                      else setErrorMessage(result.error);
                    })
                    .catch((error) =>
                      setErrorMessage(error instanceof Error ? error.message : String(error)),
                    )
                    .finally(() => setLoading(false));
                }}
              />
            </div>
          )}
        </section>
      </div>
    </Page>
  );
}
