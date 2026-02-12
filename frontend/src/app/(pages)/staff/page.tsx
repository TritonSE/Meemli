"use client";

import { useState } from "react";

import { AddStaffForm } from "@/src/components/AddStaff/AddStaffForm";
import { Button } from "@/src/components/Button";
import { Modal } from "@/src/components/Modal";
import { Page } from "@/src/components/Page";

import styles from "./page.module.css";

export default function Staff() {
  const [addOpen, setAddOpen] = useState(false);

  return (
    <Page>
      <section>
        <h1>Staff</h1>
        <Button label="Add Staff" kind="primary" onClick={() => setAddOpen(!addOpen)} />
        {addOpen && (
          <Modal
            onExit={() => setAddOpen(!addOpen)}
            child={
              <>
                <AddStaffForm onExit={() => setAddOpen(false)}/>
              </>
            }
          />
        )}
      </section>
    </Page>
  );
}
