export function DateSelect({ value, onChange }: { value: string; onChange: (d: string) => void }) {
  return (
    <div className="flex flex-col gap-2 flex-1">
      <label className="text-[12px] font-bold text-[#9B9D9F] uppercase font-montserrat">
        Session Date
      </label>
      <input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="p-3 rounded-lg border border-[#E3E2E2] bg-[#F7F6F6] font-semibold outline-none cursor-pointer"
      />
    </div>
  );
}
