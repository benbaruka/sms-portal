import React from "react";
interface CheckboxProps {
  label?: string;
  checked: boolean;
  className?: string;
  id?: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}
const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  id,
  onChange,
  className = "",
  disabled = false,
}) => {
  return (
    <label
      className={`flex cursor-pointer items-center space-x-3 ${
        disabled ? "cursor-not-allowed opacity-60" : ""
      }`}
    >
      <input
        id={id}
        type="checkbox"
        className={`h-4 w-4 ${className} dark:focus:bg-outline-none rounded border-gray-300 text-brand-500 focus:outline-none focus:ring-0 focus:ring-transparent focus:ring-offset-0 dark:border-gray-700 dark:bg-gray-800 dark:focus:outline-none dark:focus:ring-0 dark:focus:ring-transparent`}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      {label && (
        <span className="text-theme-sm font-medium text-gray-800 dark:text-white">{label}</span>
      )}
    </label>
  );
};
export default Checkbox;
