import { Page } from "../components/Page";
import { StudentForm } from "../components/StudentForm";

export function TestStudentForm() {
  return (
    <Page>
      <title>StudentForm</title>
      <StudentForm mode="create" />
    </Page>
  );
}
