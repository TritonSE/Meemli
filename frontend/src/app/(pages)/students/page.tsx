"use client";

import StudentStaffPage from "@/src/components/StudentStaffTable/StudentStaffPage";
import { useAuth } from "@/src/context/AuthContext";

export default function Students() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return <div>You must be logged in to view this page.</div>;
  }
  const state: "admin" | "teacher" = user.admin ? "admin" : "teacher";
  return <StudentStaffPage type="student" state={state} />;
}
