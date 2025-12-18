"use client";
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/light.css";
import { cn } from "@/lib/utils";
interface DateRangePickerProps {
  startDate?: Date;
  endDate?: Date;
  onChange?: (startDate: Date | undefined, endDate: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}
export function DateRangePicker({
  startDate,
  endDate,
  onChange,
  placeholder = "Select date range",
  className,
  disabled = false,
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const [dateString, setDateString] = React.useState<string>("");
  React.useEffect(() => {
    if (startDate && endDate) {
      setDateString(`${format(startDate, "yyyy-MM-dd")} to ${format(endDate, "yyyy-MM-dd")}`);
    } else if (startDate) {
      setDateString(format(startDate, "yyyy-MM-dd"));
    } else {
      setDateString("");
    }
  }, [startDate, endDate]);
  const handleDateChange = (dates: Date[]) => {
    if (dates.length === 2) {
      const [start, end] = dates;
      setDateString(`${format(start, "yyyy-MM-dd")} to ${format(end, "yyyy-MM-dd")}`);
      onChange?.(start, end);
    } else if (dates.length === 1) {
      const start = dates[0];
      setDateString(format(start, "yyyy-MM-dd"));
      onChange?.(start, undefined);
    } else {
      setDateString("");
      onChange?.(undefined, undefined);
    }
  };
  const options: {
    mode: "range";
    dateFormat: string;
    defaultDate?: string | string[] | Date[];
    minDate?: string;
    maxDate?: string;
    allowInput?: boolean;
    clickOpens?: boolean;
    disabled?: boolean;
    onChange?: (selectedDates: Date[]) => void;
  } = {
    mode: "range",
    dateFormat: "Y-m-d",
    minDate: minDate ? minDate.toISOString().split("T")[0] : undefined,
    maxDate: maxDate ? maxDate.toISOString().split("T")[0] : undefined,
    allowInput: true,
    clickOpens: !disabled,
    defaultDate:
      startDate && endDate
        ? [startDate.toISOString().split("T")[0], endDate.toISOString().split("T")[0]]
        : startDate
          ? startDate.toISOString().split("T")[0]
          : undefined,
    ...(disabled && { disabled: true }),
  };
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2">
        <CalendarIcon className="text-muted-foreground h-4 w-4" />
      </div>
      <Flatpickr
        value={dateString}
        onChange={handleDateChange}
        options={options}
        data-testid="date-range-picker-input"
        className={cn(
          "border-border/50 h-11 w-full rounded-lg border-2 bg-white pl-10 pr-3 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:focus:border-brand-500",
          !startDate && !endDate && "text-muted-foreground",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}
