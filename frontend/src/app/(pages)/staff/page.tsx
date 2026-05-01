"use client";

import AdminRoute from "@/src/components/AdminRoute/AdminRoute";
import StudentStaffPage from "@/src/components/StudentStaffTable/StudentStaffPage";
import { useAuth } from "@/src/context/AuthContext";

export default function Staff() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (!user) {
    return <div>You must be logged in to view this page.</div>;
  }
  const state: "admin" | "teacher" = user.admin ? "admin" : "teacher";
  const disabled = user.archived;
  return (
    <AdminRoute>
      <StudentStaffPage type="staff" state={state} disabled={disabled} />
    </AdminRoute>
  );
}
