import Image from "next/image";
import Link from "next/link";

import style from "./Navbar.module.css";

export function Navbar() {
  return (
    <nav className={style.sideNav}>
      <div className={style.navLinks}>
        <Link href="/">
          <Image src="/icons/logo.png" alt="Meemli logo" width={20} height={20} />
        </Link>

        <div className="horizontalLine" />

        <Link href="/programs">
          <Image
            src="/icons/nav/programs.svg"
            role="img"
            aria-label="Programs"
            alt="Programs icon"
            width={20}
            height={20}
          />
        </Link>

        <Link href="/students">
          <Image
            src="/icons/nav/students.svg"
            role="img"
            aria-label="Students"
            alt="Students icon"
            width={20}
            height={20}
          />
        </Link>

        <Link href="/attendance">
          <Image
            src="/icons/nav/attendance.svg"
            role="img"
            aria-label="Attendance"
            alt="Attendance icon"
            width={20}
            height={20}
          />
        </Link>

        <Link href="/staff">
          <Image
            src="/icons/nav/staff.svg"
            role="img"
            aria-label="Staff"
            alt="Staff icon"
            width={20}
            height={20}
          />
        </Link>

        {/* This Link is only for developers and will be removed*/}
        <Link href="/test">
          <Image
            src="/icons/nav/test.svg"
            role="img"
            aria-label="test"
            alt="Test icon"
            width={20}
            height={20}
          />
        </Link>
      </div>

      <button>
        <Image
          src="/icons/nav/logout.svg"
          role="img"
          aria-label="Logout"
          alt="Logout icon"
          width={20}
          height={20}
        />
      </button>
    </nav>
  );
}
