/* AdminUI — Order list page (visual recreation, dummy data only). */
import { AdminShell } from "./shell";
import { TrendBadge, Wave } from "./parts";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  DotsIcon,
  ExportIcon,
  FilterIcon,
  PlusIcon,
  SearchIcon,
  SortIcon,
  XIcon,
} from "./icons";

const STATUS_CARDS = [
  { title: "New orders", value: "12", dir: "down", pct: "2,67%", head: "#7D8DF6", wave: "#AAB6FA" },
  { title: "Await accepting orders", value: "20", dir: "up", pct: "2,67%", head: "#EF8E50", wave: "" },
  { title: "On way orders", value: "57", dir: "down", pct: "0,67%", head: "#F5C84C", wave: "#F7DA8B" },
  { title: "Delivered orders", value: "98", dir: "up", pct: "2,87%", head: "#63D68C", wave: "" },
] as const;

type Row = {
  no: string;
  name: string;
  phone: string;
  cat: string;
  price: string;
  date: string;
  pay: string;
  status: "on way" | "delivered" | "await";
};

const ROWS: Row[] = [
  { no: "№674839", name: "Kris Payer", phone: "099 758 9092", cat: "Laptops", price: "$ 1302,38", date: "26.07.2024", pay: "PayPal", status: "on way" },
  { no: "№674839", name: "Kris Payer", phone: "099 758 9092", cat: "Laptops", price: "$ 1302,38", date: "26.07.2024", pay: "PayPal", status: "delivered" },
  { no: "№674839", name: "Kris Payer", phone: "099 758 9092", cat: "Laptops", price: "$ 1302,38", date: "26.07.2024", pay: "PayPal", status: "await" },
  { no: "№674839", name: "Kris Payer", phone: "099 758 9092", cat: "Laptops", price: "$ 1302,38", date: "26.07.2024", pay: "PayPal", status: "on way" },
  { no: "№674839", name: "Kris Payer", phone: "099 758 9092", cat: "Laptops", price: "$ 1302,38", date: "26.07.2024", pay: "PayPal", status: "delivered" },
  { no: "№674839", name: "Kris Payer", phone: "099 758 9092", cat: "Laptops", price: "$ 1302,38", date: "26.07.2024", pay: "PayPal", status: "delivered" },
  { no: "№674839", name: "Kris Payer", phone: "099 758 9092", cat: "Laptops", price: "$ 1302,38", date: "26.07.2024", pay: "PayPal", status: "delivered" },
];

const STATUS_STYLE: Record<Row["status"], { color: string; bg: string }> = {
  "on way": { color: "#D99A0B", bg: "#FCF4DC" },
  delivered: { color: "#27A567", bg: "#E2F6EB" },
  await: { color: "#E5484D", bg: "#FDEBEC" },
};

function Checkbox() {
  return <span className="block h-[15px] w-[15px] shrink-0 rounded-[4px] border border-[#C9CFDC] bg-white" />;
}

export function AdminUIOrders() {
  return (
    <AdminShell search={false}>
      {/* status cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {STATUS_CARDS.map((c) => (
          <div
            key={c.title}
            className="relative overflow-hidden rounded-[16px] bg-white"
            style={{ boxShadow: "0 1px 2px rgba(22,23,28,.04), 0 14px 34px -26px rgba(22,23,28,.18)" }}
          >
            {c.wave && <Wave tone={c.wave} className="pointer-events-none absolute right-0 top-9 h-20 w-28" />}
            <div className="px-5 py-2.5" style={{ background: c.head }}>
              <span className="text-[12px] font-semibold text-white">{c.title}</span>
            </div>
            <div className="px-5 pb-5 pt-4">
              <div className="flex items-center gap-3">
                <span className="text-[26px] font-bold leading-none tracking-tight text-[#16171C]">{c.value}</span>
                <TrendBadge dir={c.dir} value={c.pct} />
              </div>
              <span className="mt-3 block text-[10.5px] font-medium text-[#A6ACBA]">Than last week</span>
            </div>
          </div>
        ))}
      </div>

      {/* toolbar */}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <label className="relative block h-10 w-full sm:w-[210px]">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A6ACBA]">
            <SearchIcon size={15} />
          </span>
          <input
            type="text"
            placeholder="Search"
            className="h-full w-full rounded-[12px] bg-white pl-10 pr-3 text-[12px] font-medium text-[#16171C] placeholder-[#A6ACBA] outline-none ring-[#5741E9]/25 focus:ring-4"
            style={{ boxShadow: "0 1px 2px rgba(22,23,28,.04)" }}
          />
        </label>
        <span className="text-[12px] font-medium text-[#A6ACBA]">
          <b className="font-bold text-[#16171C]">180</b> orders
        </span>
        <div className="ml-auto flex flex-wrap items-center gap-2.5">
          <button type="button" className="flex h-10 items-center gap-2 rounded-[10px] px-3 text-[12px] font-bold text-[#2F6BF2] hover:bg-white">
            <ExportIcon size={15} /> Export
          </button>
          <button type="button" className="flex h-10 items-center gap-2 rounded-[10px] bg-white px-3.5 text-[12px] font-bold text-[#16171C] shadow-[0_1px_2px_rgba(22,23,28,.05)]">
            <SortIcon size={15} className="text-[#8A90A0]" /> Sort: <span className="font-medium text-[#A6ACBA]">default</span>
          </button>
          <button type="button" className="flex h-10 items-center gap-2 rounded-[12px] bg-[#17181D] px-4 text-[12px] font-bold text-white hover:bg-[#2A2B33]">
            <PlusIcon size={14} strokeWidth={2.2} /> Add order
          </button>
        </div>
      </div>

      {/* filter row */}
      <div className="mt-4 flex flex-wrap items-center gap-2.5">
        <button type="button" aria-label="Filters" className="grid h-9 w-9 place-items-center rounded-[10px] bg-white text-[#16171C] shadow-[0_1px_2px_rgba(22,23,28,.05)]">
          <FilterIcon size={15} />
        </button>
        {["Laptops", "PayPal"].map((f) => (
          <span key={f} className="flex h-8 items-center gap-2 rounded-full bg-[#EBEDF4] px-3 text-[11.5px] font-bold text-[#16171C]">
            {f}
            <button type="button" aria-label={`Remove ${f} filter`} className="text-[#8A90A0] hover:text-[#16171C]">
              <XIcon size={11} strokeWidth={2.2} />
            </button>
          </span>
        ))}
        <button type="button" className="text-[11.5px] font-semibold text-[#A6ACBA] hover:text-[#16171C]">
          Clear all (2)
        </button>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-[11px] font-semibold text-[#A6ACBA]">
            <b className="font-bold text-[#16171C]">1</b> of 18
          </span>
          <button type="button" aria-label="Previous page" className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#C1C6D2] shadow-[0_1px_2px_rgba(22,23,28,.05)]">
            <ChevronLeft size={14} />
          </button>
          <button type="button" aria-label="Next page" className="grid h-8 w-8 place-items-center rounded-full bg-white text-[#16171C] shadow-[0_1px_2px_rgba(22,23,28,.05)]">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* table */}
      <div
        className="mt-4 overflow-hidden rounded-[18px] bg-white"
        style={{ boxShadow: "0 1px 2px rgba(22,23,28,.04), 0 14px 34px -26px rgba(22,23,28,.18)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead>
              <tr className="bg-[#EDEFF5]">
                <th className="w-12 py-3.5 pl-6 pr-2">
                  <Checkbox />
                </th>
                {["Order number", "Customer", "Category", "Price", "Date", "Payment", "Status"].map((h) => (
                  <th key={h} className="px-3 py-3.5 text-[10px] font-bold uppercase tracking-[0.09em] text-[#8A93A6]">
                    {h}
                  </th>
                ))}
                <th className="w-14 px-3 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r, i) => {
                const s = STATUS_STYLE[r.status];
                return (
                  <tr key={i} className="border-t border-[#F1F2F7] hover:bg-[#FAFBFD]">
                    <td className="py-4 pl-6 pr-2">
                      <Checkbox />
                    </td>
                    <td className="px-3 py-4 text-[12px] font-bold text-[#16171C]">{r.no}</td>
                    <td className="px-3 py-4">
                      <span className="block text-[12px] font-bold text-[#16171C]">{r.name}</span>
                      <span className="block text-[10.5px] font-medium text-[#A6ACBA]">{r.phone}</span>
                    </td>
                    <td className="px-3 py-4 text-[12px] font-medium text-[#5B6170]">{r.cat}</td>
                    <td className="px-3 py-4 text-[12px] font-semibold text-[#16171C]">{r.price}</td>
                    <td className="px-3 py-4 text-[12px] font-medium text-[#5B6170]">{r.date}</td>
                    <td className="px-3 py-4 text-[12px] font-medium text-[#5B6170]">{r.pay}</td>
                    <td className="px-3 py-4">
                      <button
                        type="button"
                        className="flex items-center gap-1.5 rounded-[8px] px-2.5 py-1.5 text-[10.5px] font-bold"
                        style={{ color: s.color, background: s.bg }}
                      >
                        {r.status}
                        <ChevronDown size={10} strokeWidth={2.4} />
                      </button>
                    </td>
                    <td className="px-3 py-4">
                      <button type="button" aria-label="Row actions" className="text-[#8A90A0] hover:text-[#16171C]">
                        <DotsIcon size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
