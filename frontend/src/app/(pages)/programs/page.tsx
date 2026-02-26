"use client";

import { useState } from "react";
import { Clock, Archive, Plus } from "lucide-react";
import { SectionCard } from "@/src/components/SectionCard";
import styles from "./page.module.css";

type Tab = "active" | "archived";

export default function Programs() {
  const [activeTab, setActiveTab] = useState<Tab>("active");

  return (
    <div className={styles.pageWrapper}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1>Classes</h1>
          <p>Take attendance, add notes, and see trends</p>
        </div>
        <button className={styles.createButton}>
          <Plus size={16} />
          Create New Class
        </button>
      </div>

      <div className={styles.controls}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === "active" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("active")}
          >
            <Clock size={15} />
            Active
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "archived" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("archived")}
          >
            <Archive size={15} />
            Archived
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        <SectionCard
          code="Arts & Crafts Group 1"
          color="#4A6D8C"
          days={["Monday"]}
          startTime="4:00 pm"
          endTime="5:00 pm"
          teachers={["Evan Chen"]}
          startDate="12 July 2025"
          endDate="18 Sept 2025"
          archived={false}
          onEdit={() => console.log("edit")}
          onArchive={() => console.log("archive")}
          onDelete={() => console.log("delete")}
        />
        <SectionCard
          code="ELA Writing Group 1"
          color="#4CAF82"
          days={["Monday"]}
          startTime="4:00 pm"
          endTime="5:00 pm"
          teachers={["Nancy Liu"]}
          startDate="12 July 2025"
          endDate="18 Sept 2025"
          archived={false}
          onEdit={() => console.log("edit")}
          onArchive={() => console.log("archive")}
          onDelete={() => console.log("delete")}
        />
        <SectionCard
          code="ELA Writing Group 2"
          color="#4CAF82"
          days={["Monday"]}
          startTime="4:00 pm"
          endTime="5:00 pm"
          teachers={["Nancy Liu"]}
          startDate="12 July 2025"
          endDate="18 Sept 2025"
          archived={false}
          onEdit={() => console.log("edit")}
          onArchive={() => console.log("archive")}
          onDelete={() => console.log("delete")}
        />
        <SectionCard
          code="Math Topic Group 1"
          color="#C4724A"
          days={["Monday"]}
          startTime="4:00 pm"
          endTime="5:00 pm"
          teachers={["Evan Chen"]}
          startDate="12 July 2025"
          endDate="18 Sept 2025"
          archived={false}
          onEdit={() => console.log("edit")}
          onArchive={() => console.log("archive")}
          onDelete={() => console.log("delete")}
        />
      </div>
    </div>
  );
}
