"use client";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp, Search, X } from "lucide-react";
import * as React from "react";
import { createPortal } from "react-dom";

interface SelectContextValue {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLabel: string;
  setSelectedLabel: (label: string) => void;
  searchable?: boolean;
  searchValue: string;
  setSearchValue: (value: string) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined);

const useSelectContext = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("Select components must be used within Select");
  }
  return context;
};

interface SelectProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  searchable?: boolean;
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ value: controlledValue, defaultValue, onValueChange, children, searchable = false }, ref) => {
    const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue || "");
    const [open, setOpen] = React.useState(false);
    const [selectedLabel, setSelectedLabel] = React.useState("");
    const [searchValue, setSearchValue] = React.useState("");
    const selectRef = React.useRef<HTMLDivElement>(null);
    const triggerRef = React.useRef<HTMLButtonElement | null>(null);

    const isControlled = controlledValue !== undefined;
    const value = isControlled ? controlledValue : uncontrolledValue;

    const handleValueChange = React.useCallback(
      (newValue: string) => {
        if (!isControlled) {
          setUncontrolledValue(newValue);
        }
        onValueChange?.(newValue);
        setOpen(false);
        setSearchValue(""); // Reset search when value changes
      },
      [isControlled, onValueChange]
    );

    const handleOpenChange = React.useCallback((newOpen: boolean) => {
      setOpen(newOpen);
      if (!newOpen) {
        setSearchValue(""); // Reset search when closed
      }
    }, []);

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
          setOpen(false);
          setSearchValue("");
        }
      };

      if (open) {
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
      }
    }, [open]);

    const contextValue = React.useMemo<SelectContextValue>(
      () => ({
        value: value || "",
        onValueChange: handleValueChange,
        open,
        onOpenChange: handleOpenChange,
        selectedLabel,
        setSelectedLabel,
        searchable,
        searchValue,
        setSearchValue,
        triggerRef,
      }),
      [value, handleValueChange, open, handleOpenChange, selectedLabel, searchable, searchValue]
    );

    return (
      <SelectContext.Provider value={contextValue}>
        <div
          ref={(node) => {
            selectRef.current = node;
            if (typeof ref === "function") {
              ref(node);
            } else if (ref) {
              (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
            }
          }}
          className="relative w-full"
          style={{ overflow: "visible" }}
        >
          {children}
        </div>
      </SelectContext.Provider>
    );
  }
);
Select.displayName = "Select";

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  className?: string;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, onOpenChange, triggerRef } = useSelectContext();
    const listboxIdRef = React.useRef<string | null>(null);
    const internalRef = React.useRef<HTMLButtonElement>(null);

    // Combine refs
    React.useImperativeHandle(ref, () => internalRef.current as HTMLButtonElement, []);

    React.useEffect(() => {
      if (internalRef.current) {
        triggerRef.current = internalRef.current;
      }
    }, [triggerRef]);

    // Get the listbox ID from the SelectContent when it's rendered
    React.useEffect(() => {
      if (open) {
        // Find the listbox element in the DOM
        const listbox = document.querySelector('[role="listbox"]');
        if (listbox && listbox.id) {
          listboxIdRef.current = listbox.id;
        }
      }
    }, [open]);

    return (
      <button
        ref={internalRef}
        type="button"
        role="combobox"
        aria-expanded="false"
        aria-haspopup="listbox"
        aria-controls={listboxIdRef.current || undefined}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border-2 border-gray-100 dark:border-gray-700",
          "bg-white text-gray-900 dark:bg-gray-900 dark:text-white",
          "px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:ring-offset-2 dark:focus:border-brand-400 dark:focus:ring-brand-400/20",
          "placeholder:text-muted-foreground transition-colors disabled:cursor-not-allowed disabled:bg-gray-50 disabled:opacity-50 dark:disabled:bg-gray-800/50",
          className
        )}
        onClick={() => onOpenChange(!open)}
        {...props}
      >
        {children}
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-gray-500 opacity-60 transition-transform dark:text-gray-400",
            open && "rotate-180"
          )}
        />
      </button>
    );
  }
);
SelectTrigger.displayName = "SelectTrigger";
interface SelectValueProps {
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
}

const SelectValue = React.forwardRef<HTMLSpanElement, SelectValueProps>(
  ({ placeholder, className, children }, ref) => {
    const { value, selectedLabel } = useSelectContext();

    // If children are provided, use them (for custom display)
    if (children) {
      return (
        <span
          ref={ref}
          className={cn("block truncate", !value && "text-muted-foreground", className)}
        >
          {children}
        </span>
      );
    }

    // Show selected label if available, otherwise show placeholder
    return (
      <span
        ref={ref}
        className={cn("block truncate", !value && "text-muted-foreground", className)}
      >
        {selectedLabel || value || placeholder}
      </span>
    );
  }
);
SelectValue.displayName = "SelectValue";

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ children, className }, ref) => {
    const { open, searchable, searchValue, setSearchValue, triggerRef } = useSelectContext();
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [positionStyle, setPositionStyle] = React.useState<React.CSSProperties>({});
    const listboxId = React.useId();

    React.useEffect(() => {
      if (open && triggerRef.current && typeof window !== "undefined") {
        const updatePosition = () => {
          if (triggerRef.current) {
            const triggerRect = triggerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const viewportWidth = window.innerWidth;
            const spaceBelow = viewportHeight - triggerRect.bottom;
            const spaceAbove = triggerRect.top;

            let left = triggerRect.left;
            let maxHeight = 300;
            let width = triggerRect.width;

            // Ensure the dropdown doesn't go off-screen horizontally
            if (left + width > viewportWidth - 10) {
              left = viewportWidth - width - 10;
            }
            if (left < 10) {
              left = 10;
              width = Math.min(width, viewportWidth - 20);
            }

            // If there's not enough space below (less than 200px), position above
            if (spaceBelow < 200 && spaceAbove > spaceBelow) {
              // Position above the trigger - use bottom to anchor to trigger top
              maxHeight = Math.min(300, spaceAbove - 20);
              setPositionStyle({
                position: "fixed",
                bottom: `${viewportHeight - triggerRect.top + 4}px`,
                left: `${left}px`,
                width: `${width}px`,
                maxHeight: `${Math.max(100, maxHeight)}px`,
                zIndex: 9999999,
              });
            } else {
              // Position below the trigger (default)
              maxHeight = Math.min(300, spaceBelow - 20);
              setPositionStyle({
                position: "fixed",
                top: `${triggerRect.bottom + 4}px`,
                left: `${left}px`,
                width: `${width}px`,
                maxHeight: `${Math.max(100, maxHeight)}px`,
                zIndex: 9999999,
              });
            }
          }
        };

        // Wait a bit for the DOM to be ready
        const timeoutId = setTimeout(() => {
          requestAnimationFrame(updatePosition);
        }, 0);

        const handleScroll = () => {
          requestAnimationFrame(updatePosition);
        };

        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", updatePosition);

        return () => {
          clearTimeout(timeoutId);
          window.removeEventListener("scroll", handleScroll, true);
          window.removeEventListener("resize", updatePosition);
        };
      } else {
        setPositionStyle({});
      }
    }, [open, triggerRef]);

    if (!open) return null;
    if (typeof window === "undefined") return null;

    const content = (
      <div
        ref={(node) => {
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
          contentRef.current = node;
        }}
        style={positionStyle}
        className={cn(
          "fixed z-[9999999] min-w-[8rem] rounded-xl border border-gray-200 dark:border-gray-700",
          "bg-white text-gray-900 shadow-lg dark:bg-gray-900 dark:text-gray-100",
          "animate-in fade-in-0 zoom-in-95 pointer-events-auto",
          className
        )}
        onWheel={(e) => {
          e.stopPropagation();
        }}
        onClick={(e) => {
          e.stopPropagation();
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
        }}
      >
        {searchable && (
          <div className="sticky top-0 z-10 border-b border-gray-200 bg-white p-2 dark:border-gray-700 dark:bg-gray-900">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                className="h-8 pl-8 pr-8 text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    setSearchValue("");
                  }
                  e.stopPropagation();
                }}
              />
              {searchValue && (
                <button
                  type="button"
                  onClick={() => setSearchValue("")}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        )}
        <div
          ref={contentRef}
          id={listboxId}
          className="max-h-[280px] overflow-y-auto overflow-x-hidden p-1 [scrollbar-color:rgba(156,163,175,0.5)_transparent] [scrollbar-width:thin]"
          onWheel={(e) => {
            // Prevent page scroll when scrolling inside select
            e.stopPropagation();
          }}
        >
          {children}
        </div>
      </div>
    );

    return createPortal(content, document.body);
  }
);
SelectContent.displayName = "SelectContent";

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ value, children, className, disabled, ...props }, ref) => {
    const {
      value: selectedValue,
      onValueChange,
      setSelectedLabel,
      searchValue,
    } = useSelectContext();
    const isSelected = selectedValue === value;

    // Filter items based on search value
    const itemText =
      typeof children === "string" ? children : React.Children.toArray(children).join("");
    const matchesSearch =
      !searchValue || itemText.toLowerCase().includes(searchValue.toLowerCase());

    const handleClick = React.useCallback(() => {
      if (!disabled) {
        // Store the label (children) when item is selected
        setSelectedLabel(itemText);
        onValueChange(value);
      }
    }, [disabled, itemText, setSelectedLabel, onValueChange, value]);

    // Hide item if it doesn't match search
    if (searchValue && !matchesSearch) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex w-full cursor-default select-none items-center rounded-md py-2 pl-8 pr-2 text-sm",
          "text-gray-900 outline-none transition-colors dark:text-gray-100",
          "focus:bg-brand-50 focus:text-brand-700 dark:focus:bg-gray-800 dark:focus:text-white",
          "hover:bg-brand-50 dark:hover:bg-gray-800",
          disabled && "pointer-events-none opacity-50",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {isSelected && (
          <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
            <Check className="h-4 w-4 text-brand-600" />
          </span>
        )}
        <span>{children}</span>
      </div>
    );
  }
);
SelectItem.displayName = "SelectItem";

const SelectGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("w-full p-1", className)} {...props} />
  )
);
SelectGroup.displayName = "SelectGroup";

const SelectLabel = React.forwardRef<HTMLLabelElement, React.LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "py-1.5 pl-8 pr-2 text-sm font-semibold text-gray-700 dark:text-gray-300",
        className
      )}
      {...props}
    />
  )
);
SelectLabel.displayName = "SelectLabel";

const SelectSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-gray-200 dark:bg-gray-700", className)}
      {...props}
    />
  )
);
SelectSeparator.displayName = "SelectSeparator";

const SelectScrollUpButton = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex cursor-default items-center justify-center py-1", className)}
      {...props}
    >
      <ChevronUp className="h-4 w-4" />
    </div>
  )
);
SelectScrollUpButton.displayName = "SelectScrollUpButton";

const SelectScrollDownButton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex cursor-default items-center justify-center py-1", className)}
    {...props}
  >
    <ChevronDown className="h-4 w-4" />
  </div>
));
SelectScrollDownButton.displayName = "SelectScrollDownButton";

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};
