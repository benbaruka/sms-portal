declare module "react-flatpickr" {
  import * as React from "react";

  export interface FlatpickrOptions {
    dateFormat?: string;
    defaultDate?: string | Date | Date[];
    minDate?: string | Date;
    maxDate?: string | Date;
    allowInput?: boolean;
    clickOpens?: boolean;
    disabled?: boolean;
    onChange?: (selectedDates: Date[], dateStr: string, instance: unknown) => void;
    [key: string]: unknown;
  }
  //ok
  export interface FlatpickrProps {
    value?: string | Date | Date[];
    onChange?: (selectedDates: Date[], dateStr: string, instance: unknown) => void;
    options?: FlatpickrOptions;
    className?: string;
    placeholder?: string;
    disabled?: boolean;
  }

  const Flatpickr: React.FC<FlatpickrProps>;
  export default Flatpickr;
}
