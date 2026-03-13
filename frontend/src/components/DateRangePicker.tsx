"use client";

import { useState, useRef, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { format, isValid } from "date-fns";
import { Calendar } from "lucide-react";
import "react-day-picker/style.css";

interface DateRangePickerProps {
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
  placeholder?: string;
  className?: string;
}

function toDateStr(s: string): Date | undefined {
  if (!s) return undefined;
  const d = new Date(s);
  return isValid(d) ? d : undefined;
}

function toISODate(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

export function DateRangePicker({
  from,
  to,
  onChange,
  placeholder = "Select date range",
  className = "",
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const [fromDate, setFromDate] = useState<Date | undefined>(() => toDateStr(from));
  const [toDateVal, setToDateVal] = useState<Date | undefined>(() => toDateStr(to));
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedRange =
    fromDate && toDateVal
      ? { from: fromDate, to: toDateVal }
      : fromDate
        ? { from: fromDate, to: fromDate }
        : undefined;

  const displayText =
    from && to
      ? `${format(new Date(from), "MMM d, yyyy")} – ${format(new Date(to), "MMM d, yyyy")}`
      : from
        ? `From ${format(new Date(from), "MMM d, yyyy")}`
        : placeholder;

  const handleSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range?.from) {
      setFromDate(undefined);
      setToDateVal(undefined);
      onChange("", "");
      return;
    }
    setFromDate(range.from);
    if (range.to) {
      setToDateVal(range.to);
      onChange(toISODate(range.from), toISODate(range.to));
      setOpen(false);
    } else {
      setToDateVal(undefined);
      onChange(toISODate(range.from), "");
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFromDate(undefined);
    setToDateVal(undefined);
    onChange("", "");
    setOpen(false);
  };

  useEffect(() => {
    setFromDate(toDateStr(from));
    setToDateVal(toDateStr(to));
  }, [from, to]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current?.contains(e.target as Node)) return;
      setOpen(false);
    };
    if (open) {
      document.addEventListener("click", handleClickOutside);
    }
    return () => document.removeEventListener("click", handleClickOutside);
  }, [open]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-turf-800 border border-turf-600 rounded-lg text-white text-sm hover:border-turf-500 focus:ring-2 focus:ring-accent focus:border-accent min-w-[240px] text-left justify-between"
      >
        <span className="flex items-center gap-2 min-w-0">
          <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
          <span className={from || to ? "text-white" : "text-slate-500 truncate"}>
            {displayText}
          </span>
        </span>
        {open ? (
          <span className="text-slate-500 shrink-0">▲</span>
        ) : (
          <span className="text-slate-500 shrink-0">▼</span>
        )}
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-full left-0 mt-1 z-50 bg-turf-800 border border-turf-600 rounded-xl shadow-xl p-4 [&_.rdp-root]:[--rdp-accent-color:#22c55e] [&_.rdp-root]:[--rdp-accent-background-color:rgba(34,197,94,0.2)] [&_.rdp-root]:[--rdp-range_middle-background-color:rgba(34,197,94,0.15)] [&_.rdp-root]:[--rdp-range_start-date-background-color:#22c55e] [&_.rdp-root]:[--rdp-range_end-date-background-color:#22c55e] [&_.rdp-day_button]:!rounded-lg [&_.rdp-day]:!text-slate-300 [&_.rdp-day_button:hover]:!bg-turf-600 [&_.rdp-weekday]:!text-slate-500 [&_.rdp-caption_label]:!text-white [&_.rdp-nav_button]:!text-slate-400 [&_.rdp-nav_button:hover]:!bg-turf-600 [&_.rdp-nav_button:hover]:!text-white"
        >
          <DayPicker
            mode="range"
            selected={selectedRange}
            onSelect={handleSelect}
            defaultMonth={fromDate ?? toDateVal ?? new Date()}
            numberOfMonths={1}
            disabled={{ after: new Date() }}
          />
          <div className="flex justify-end gap-2 mt-3 pt-3 border-t border-turf-600">
            <button
              type="button"
              onClick={handleClear}
              className="px-3 py-1.5 text-sm text-slate-400 hover:text-white hover:bg-turf-600 rounded-lg transition-colors"
            >
              Clear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
