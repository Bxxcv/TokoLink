/* AdminUI — Dashboard (visual recreation, dummy data only). */
import { AdminShell } from "./shell";
import {
  AP,
  Card,
  CircleArrow,
  CATEGORIES,
  Donut,
  RevenueBars,
  TrendBadge,
  Wave,
} from "./parts";
import { CalendarIcon, CheckIcon, ChevronDown, PersonIcon } from "./icons";

function MetricCard({
  title,
  value,
  dir,
  pct,
  accent = false,
}: {
  title: string;
  value: string;
  dir: "up" | "down";
  pct: string;
  accent?: boolean;
}) {
  return (
    <div
      className="flex flex-col rounded-[18px] p-5"
      style={
        accent
          ? { background: AP.accent, boxShadow: "0 18px 36px -18px rgba(87,65,233,.55)" }
          : { background: "#fff", boxShadow: "0 1px 2px rgba(22,23,28,.04), 0 14px 34px -26px rgba(22,23,28,.18)" }
      }
    >
      <div className="flex items-start justify-between">
        <span className={`text-[13px] font-semibold ${accent ? "text-white/90" : "text-[#16171C]"}`}>{title}</span>
        <CircleArrow tone={accent ? "white" : "light"} size={34} />
      </div>
      <div className="mt-6 flex flex-wrap items-center gap-2.5">
        <span className={`text-[26px] font-bold leading-none tracking-tight ${accent ? "text-white" : "text-[#16171C]"}`}>
          {value}
        </span>
        <TrendBadge dir={dir} value={pct} />
      </div>
      <span className={`mt-4 text-[11px] font-medium ${accent ? "text-white/55" : "text-[#A6ACBA]"}`}>
        This month vs last
      </span>
    </div>
  );
}

function BigStatCard({
  icon,
  value,
  unit,
  note,
  highlight,
  decor,
  decorBottom,
  arrow,
}: {
  icon: React.ReactNode;
  value: string;
  unit: string;
  note: React.ReactNode;
  highlight?: string;
  decor?: boolean;
  decorBottom?: boolean;
  arrow?: boolean;
}) {
  void highlight;
  return (
    <Card className="min-h-[196px] overflow-visible">
      {decor && <Wave className="pointer-events-none absolute -right-2 top-2 h-24 w-32" />}
      {decorBottom && <Wave className="pointer-events-none absolute -bottom-2 right-0 h-16 w-24" />}
      {arrow && (
        <span className="absolute -left-[21px] top-[38%] z-10 hidden lg:block">
          <CircleArrow tone="dark" size={42} />
        </span>
      )}
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#F0F1F6] text-[#17181D]">{icon}</span>
      <div className="mt-7 flex items-baseline gap-2">
        <span className="text-[38px] font-extrabold leading-none tracking-tight text-[#16171C]">{value}</span>
        <span className="text-[17px] font-semibold text-[#16171C]">{unit}</span>
      </div>
      <p className="mt-3 text-[11.5px] font-medium text-[#5B6170]">{note}</p>
    </Card>
  );
}

export function AdminUIDashboard() {
  return (
    <AdminShell>
      {/* header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[25px] font-bold tracking-tight text-[#16171C] sm:text-[28px]">
            Hello, Barbara!{" "}
            <span className="align-middle text-[24px]">👋</span>
          </h1>
          <p className="mt-1.5 text-[12.5px] font-medium text-[#9AA0AE]">
            This is what's happening in your store this month.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="flex h-9 items-center gap-2 rounded-[10px] bg-white px-3.5 text-[12px] font-bold text-[#16171C] shadow-[0_1px_2px_rgba(22,23,28,.05)]"
          >
            This month <ChevronDown size={13} strokeWidth={2.2} className="text-[#8A90A0]" />
          </button>
          <button type="button" aria-label="Calendar" className="grid h-9 w-9 place-items-center rounded-[10px] bg-white text-[#16171C] shadow-[0_1px_2px_rgba(22,23,28,.05)]">
            <CalendarIcon size={15} />
          </button>
        </div>
      </div>

      {/* metric grid */}
      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr_1.32fr]">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:col-span-2 lg:grid-rows-2">
          <MetricCard accent title="Total revenue" value="$ 99.560" dir="up" pct="2,67%" />
          <MetricCard title="Total orders" value="35" dir="down" pct="2,67%" />
          <MetricCard title="Total visitors" value="45.600" dir="down" pct="2,67%" />
          <MetricCard title="Net profit" value="$ 60.450" dir="up" pct="5,67%" />
        </div>

        {/* revenue chart */}
        <Card className="flex flex-col">
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-[15px] font-bold text-[#16171C]">Revenue</h2>
              <span className="text-[10.5px] font-medium text-[#A6ACBA]">This month vs last</span>
            </div>
            <CircleArrow tone="dark" size={38} />
          </div>
          <div className="flex-1">
            <RevenueBars />
          </div>
        </Card>
      </div>

      {/* bottom cards */}
      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr_1.32fr]">
        <BigStatCard
          decorBottom
          icon={<CheckIcon size={17} />}
          value="98"
          unit="orders"
          note={
            <>
              12 orders <span className="font-semibold text-[#F26D6D]">are awaiting</span> confirmation.
            </>
          }
        />
        <BigStatCard
          arrow
          decor
          icon={<PersonIcon size={17} />}
          value="17"
          unit="customers"
          note={
            <>
              17 customers <span className="font-semibold text-[#F26D6D]">are waiting</span> for response.
            </>
          }
        />
        <Card>
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-[15px] font-bold text-[#16171C]">Sales by Category</h2>
              <span className="text-[10.5px] font-medium text-[#A6ACBA]">This month vs last</span>
            </div>
            <CircleArrow tone="dark" size={38} />
          </div>
          <div className="mt-5 flex flex-col items-center gap-6 sm:flex-row">
            <Donut size={164} />
            <ul className="w-full min-w-0 space-y-2.5">
              {CATEGORIES.map((c) => (
                <li key={c.name} className="flex items-center gap-2.5">
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.color }} />
                  <span className="truncate text-[10.5px] font-semibold text-[#5B6170]">{c.name}</span>
                </li>
              ))}
            </ul>
          </div>
        </Card>
      </div>
    </AdminShell>
  );
}
