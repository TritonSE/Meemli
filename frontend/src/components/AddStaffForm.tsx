// import styles from "./AddStaffForm.module.css";

import { TextField } from "./TextField";
import { Button } from "./Button";


// export type TextFieldProps = {
//   label: string;
//   error?: boolean;
//   required?: boolean;
// } & Omit<React.ComponentProps<"input">, "type">;


// type AddStaffFormProps = {

// };
// export const AddStaffForm = function AddStaffForm({ child, onExit }: ModalProps) {


// add the create user function 
export const AddStaffForm = function AddStaffForm() {
    return (
        <div>
            <h1>Add Staff</h1>
            <TextField label="First Name" required />
            <TextField label="Last Name" required />
            <TextField label="Phone Number" required />
            <TextField label="Role" required />
            <TextField label="Assigned Programs" />
            <Button label="Cancel" kind="secondary" />
            <Button label="Add Staff Member" kind="primary" />
    </div>    
  );
};
