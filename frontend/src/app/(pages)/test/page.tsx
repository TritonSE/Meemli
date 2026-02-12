"use client";
import { Button } from "@tritonse/tse-constellation";
import Image from "next/image";

import { ProfilePicture } from "../../(ui)/_components/ProfilePicture/ProfilePicture";

import styles from "./StudentProfile.module.css";

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
      <div className={styles.studentProfileModal}>
        <Button className={styles.closeButton}>
          <Image src={"/icons/x.svg"} alt="Close" width={20} height={20} />
        </Button>
        <div>
          <div>
            student summary card
            <ProfilePicture size="small" letter="John" />
            <span>John Smith </span>
            <address>john.smith@example.com</address>
            <div>
              {" "}
              <span> 14th grade</span> School (University California San Diego){" "}
            </div>
          </div>

          <div>
            <div> info nav - info, programs, attendance, assessemetns, notes </div>
            <div> info section </div>
          </div>
        </div>
      </div>
    </div>
  );
}
