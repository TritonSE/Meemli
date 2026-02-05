"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Tooltip } from "../Tooltip/Tooltip";

import style from "./Navbar.module.css";

type NavItem = {
  href: string;
  icon: string;
  label: string;
};

const navItems: NavItem[] = [
  { href: "/programs", icon: "/icons/nav/programs.svg", label: "Programs" },
  { href: "/students", icon: "/icons/nav/students.svg", label: "Students" },
  { href: "/attendance", icon: "/icons/nav/attendance.svg", label: "Attendance" },
  { href: "/staff", icon: "/icons/nav/staff.svg", label: "Staff" },
  { href: "/test", icon: "/icons/nav/test.svg", label: "Test" },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <nav className={style.sideNav}>
      <div className={style.navLinks}>
        <Link href="/">
          <Image
            src="/icons/logo.png"
            className={style.logo}
            alt="Meemli logo"
            width={20}
            height={20}
          />
        </Link>

        <div className="horizontalLine" />

        {navItems.map(({ href, icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Tooltip key={href} content={label}>
              <Link
                href={href}
                className={`${style.navLink} ${isActive ? style.activeNavLink : ""}`}
              >
                <Image
                  src={icon}
                  alt={`${label} icon`}
                  aria-label={label}
                  width={20}
                  height={20}
                  className={style.navIcon}
                />
              </Link>
            </Tooltip>
          );
        })}
      </div>

      <button>
        <Image src="/icons/nav/logout.svg" alt="Logout icon" width={20} height={20} />
      </button>
    </nav>
  );
}
