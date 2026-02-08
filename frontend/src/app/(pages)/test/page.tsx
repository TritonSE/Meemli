"use client";
import { Button } from "@tritonse/tse-constellation";

import { TestStudentForm } from "@/src/pages/TestStudentForm";

/* 
All constellation components can be found here:
https://tritonse.github.io/TSE-Constellation/?path=/docs/welcome--documentation
*/
export default function Test() {
  return (
    <div>
      This Test Page is meant for developers and will be removed in the MVP.
      <br />
      <div style={{ display: "flex", gap: "8px" }}>
        <Button> Button </Button>
        <Button variant="secondary"> Secondary Button </Button>
        <Button variant="tag"> Tag Variant Button </Button>
        <Button leadingIcon="ic_upload"> Leading Icon Button</Button>
        <Button trailingIcon="ic_upload"> Trailing Button</Button>
        <Button disabled> Disabled Button </Button>
        <Button small> Small Button </Button>
        <Button destructive> Small Button </Button>
      </div>
      <TestStudentForm />
    </div>
  );
}
