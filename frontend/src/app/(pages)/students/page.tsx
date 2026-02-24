"use client";
import { useEffect, useState } from "react";

import type { Section } from "@/src/api/sections";
import type { Student } from "@/src/api/students";

import { getAllSections } from "@/src/api/sections";
import { getAllStudents } from "@/src/api/students";
import { Button } from "@/src/components/Button";
import { Table } from "@/src/components/Table";

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [isLoading, setLoading] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isEdit, setEdit] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    getAllStudents()
      .then((result) => {
        if (result.success) {
          setStudents(result.data);
        } else {
          setErrorMessage(result.error);
        }
      })
      .catch((error) => setErrorMessage(error instanceof Error ? error.message : String(error)))
      .finally(() => setLoading(false));

    getAllSections()
      .then((result) => {
        if (result.success) {
          setSections(result.data);
        } else {
          setErrorMessage(result.error);
        }
      })
      .catch((error) => setErrorMessage(error instanceof Error ? error.message : String(error)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", gap: "10px" }}>
      <div>This is Students page</div>
      <Button label="Toggle Edit" kind="primary" onClick={() => setEdit(!isEdit)} />
      <Table
        data={students}
        setData={setStudents}
        sections={sections}
        type="student"
        isEdit={isEdit}
        selected={selected}
        setSelected={setSelected}
      />
    </div>
  );
}
