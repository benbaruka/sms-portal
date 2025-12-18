"use client";
import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/light.css";
import { cn } from "@/lib/utils";
interface DatePickerProps {
  value?: Date;
  onChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minDate?: Date;
  maxDate?: Date;
}
export function DatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
  disabled = false,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [dateString, setDateString] = React.useState<string>(
    value ? format(value, "yyyy-MM-dd") : ""
  );
  React.useEffect(() => {
    if (value) {
      setDateString(format(value, "yyyy-MM-dd"));
    } else {
      setDateString("");
    }
  }, [value]);
  const handleDateChange = (dates: Date[]) => {
    const selectedDate = dates[0];
    if (selectedDate) {
      setDateString(format(selectedDate, "yyyy-MM-dd"));
      onChange?.(selectedDate);
    } else {
      setDateString("");
      onChange?.(undefined);
    }
  };
  const options: {
    dateFormat: string;
    defaultDate?: string | Date;
    minDate?: string;
    maxDate?: string;
    allowInput?: boolean;
    clickOpens?: boolean;
    disabled?: boolean;
    onChange?: (selectedDates: Date[]) => void;
  } = {
    dateFormat: "Y-m-d",
    minDate: minDate ? minDate.toISOString().split("T")[0] : undefined,
    maxDate: maxDate ? maxDate.toISOString().split("T")[0] : undefined,
    allowInput: true,
    clickOpens: !disabled,
    defaultDate: value ? value.toISOString().split("T")[0] : undefined,
    ...(disabled && { disabled: true }),
  };
  return (
    <div className="relative w-full">
      <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
        <CalendarIcon className="text-muted-foreground h-4 w-4" />
      </div>
      <Flatpickr
        value={dateString}
        onChange={handleDateChange}
        options={options}
        className={cn(
          "border-border/50 h-11 w-full rounded-lg border-2 bg-white pl-10 pr-3 text-gray-900 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:bg-gray-800 dark:text-white",
          !value && "text-muted-foreground",
          disabled && "cursor-not-allowed opacity-50",
          className
        )}
        placeholder={placeholder}
        disabled={disabled}
      />
    </div>
  );
}
