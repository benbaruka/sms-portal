"use client";
import React, { useState, useRef, useEffect } from "react";
interface Option {
  value: string;
  label: string;
}
interface SelectProps {
  options: Option[];
  onSearch: (q: string) => void;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  _disabled?: boolean;
  defaultValue?: string;
}
const Select: React.FC<SelectProps> = ({
  options,
  onSearch,
  onChange,
  placeholder = "Rechercher...",
  className = "",
  _disabled = false,
  defaultValue,
}) => {
  const [search, setSearch] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    onSearch(value);
    setShowDropdown(true);
  };
  const handleSelect = (option: Option) => {
    setSelectedLabel(option.label);
    onChange(option.value);
    setShowDropdown(false);
    setSearch("");
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      <input
        type="text"
        placeholder={placeholder}
        value={showDropdown ? search : selectedLabel}
        onChange={handleChange}
        onFocus={() => setShowDropdown(true)}
        defaultValue={defaultValue!}
        disabled={_disabled}
        className="h-11 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
      />
      {showDropdown && options.length > 0 && (
        <ul className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
          {options.map((option) => (
            <li
              key={option.value}
              onClick={() => handleSelect(option)}
              className="cursor-pointer px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700"
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
export default Select;
