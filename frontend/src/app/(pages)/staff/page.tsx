"use client";

import { useState } from "react";

import { AddStaffForm } from "@/src/components/AddStaffForm";
import { Modal } from "@/src/components/Modal";

import { Button } from "@/src/components/Button";

export default function Staff() {
  const [addOpen, setAddOpen] = useState(false);
  
  return (
    <div>
      <section>
        <h1>Staff</h1>
          <Button label="Add Staff" onClick={() => setAddOpen(!addOpen)} />
          { addOpen && (
            <Modal 
              onExit={() => setAddOpen(!addOpen)}
              child={
                <>
                  <AddStaffForm />
                </>
              }
            />
          )}
      </section>
    </div>
  );
}
