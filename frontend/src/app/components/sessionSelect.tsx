import type { AttendanceSession } from "@/src/api/attendance";

export function SectionSelect({
  sessions,
  value,
  onChange,
}: {
  sessions: AttendanceSession[];
  value: string;
  onChange: (id: string) => void;
}) {
  const uniqueSections = Array.from(
    new Map(sessions.map((s) => [s.section?._id, s.section])).values(),
  ).filter(Boolean);

  return (
    <div className="flex flex-col gap-2 flex-1">
      <label className="text-[12px] font-bold text-[#9B9D9F] uppercase font-montserrat">
        Class Section
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="p-3 rounded-lg border border-[#E3E2E2] bg-[#F7F6F6] font-semibold outline-none"
      >
        <option value="">Select a Section</option>
        {uniqueSections.map((sec) => (
          <option key={sec._id} value={sec._id}>
            {sec.code}
          </option>
        ))}
      </select>
    </div>
  );
}
