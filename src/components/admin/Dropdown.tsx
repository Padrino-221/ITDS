"use client";

import { useState, useRef, useEffect, useId } from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface DropdownItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  danger?: boolean;
}

export function Dropdown({
  trigger,
  items,
  align = "right",
}: {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          // Keyboard access for button-style triggers: Enter/Space already
          // click the button, ArrowDown opens the menu. Escape closes it.
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setOpen(true);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className="cursor-pointer"
      >
        {trigger}
      </div>
      {open && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[180px] overflow-hidden rounded-xl border border-forest-100 bg-white py-1.5 animate-scale-in",
            align === "right" ? "right-0" : "left-0"
          )}
        >
          {items.map((item, i) => (
            <button
              key={i}
              onClick={() => {
                item.onClick();
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:bg-forest-50",
                item.danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-ink hover:bg-forest-50"
              )}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuButton({
  children,
  items,
  align = "right",
}: {
  children: React.ReactNode;
  items: DropdownItem[];
  align?: "left" | "right";
}) {
  return (
    <Dropdown
      align={align}
      trigger={
        <button className="inline-flex items-center gap-1.5 rounded-lg border border-forest-200 bg-white px-3 py-2 text-sm font-semibold text-ink-soft transition-colors hover:border-forest-400 hover:text-ink">
          {children}
          <ChevronDown className="h-3.5 w-3.5" />
        </button>
      }
      items={items}
    />
  );
}

// ------------------------------------------------------------------
// Form-ready custom select (replaces native <select>)
// Submits its value through a hidden input so it works with
// server-action forms, while offering a styled listbox with full
// keyboard support.
// ------------------------------------------------------------------

export function Select({
  name,
  options,
  defaultValue = "",
  placeholder = "Select an option",
  required,
  size = "md",
  className,
  value,
  onChange,
}: {
  name?: string;
  options: Array<{ value: string; label: string }>;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  size?: "sm" | "md";
  className?: string;
  /** Controlled mode: when both `value` and `onChange` are provided the
   *  select reports changes through the callback instead of its own state. */
  value?: string;
  onChange?: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [highlight, setHighlight] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLUListElement>(null);
  const autoId = useId();
  const listboxId = `select-listbox-${autoId}`;
  const triggerId = `select-trigger-${autoId}`;

  const controlled = value !== undefined && onChange !== undefined;
  const current = controlled ? value : internalValue;
  const selected = options.find((o) => o.value === current);

  const setValue = (next: string) => {
    if (controlled) {
      onChange(next);
    } else {
      setInternalValue(next);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keep the highlighted option in view
  useEffect(() => {
    if (open && listboxRef.current) {
      const el = listboxRef.current.children[highlight] as HTMLElement | undefined;
      el?.scrollIntoView({ block: "nearest" });
    }
  }, [open, highlight]);

  const openSelect = () => {
    const index = options.findIndex((o) => o.value === current);
    setHighlight(index >= 0 ? index : 0);
    setOpen(true);
  };

  const selectOption = (option: { value: string; label: string }) => {
    setValue(option.value);
    setOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        openSelect();
      }
      return;
    }
    switch (e.key) {
      case "Escape":
        setOpen(false);
        break;
      case "ArrowDown":
        e.preventDefault();
        setHighlight((h) => Math.min(h + 1, options.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlight((h) => Math.max(h - 1, 0));
        break;
      case "Home":
        e.preventDefault();
        setHighlight(0);
        break;
      case "End":
        e.preventDefault();
        setHighlight(options.length - 1);
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (options[highlight]) selectOption(options[highlight]);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  };

  return (
    <div
      ref={rootRef}
      className={cn("relative", className)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        type="button"
        id={triggerId}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listboxId : undefined}
        onClick={() => (open ? setOpen(false) : openSelect())}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-lg border border-forest-200 bg-white text-ink transition-colors focus:border-forest-500 focus:outline-none focus:ring-2 focus:ring-forest-500/20",
          size === "sm" ? "px-3 py-1.5 text-xs" : "px-3.5 py-2.5 text-sm",
          open && "border-forest-500 ring-2 ring-forest-500/20",
          !selected && "text-ink-soft/70"
        )}
      >
        <span className="truncate text-left">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-ink-soft transition-transform",
            open && "rotate-180"
          )}
        />
      </button>
      {open && (
        <ul
          id={listboxId}
          ref={listboxRef}
          role="listbox"
          aria-labelledby={triggerId}
          className="absolute z-50 mt-2 max-h-64 w-full overflow-auto rounded-xl border border-forest-100 bg-white py-1.5 shadow-lg animate-scale-in"
        >
          {options.map((option, i) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === current}
              onMouseEnter={() => setHighlight(i)}
              onClick={() => selectOption(option)}
              className={cn(
                "flex w-full cursor-pointer items-center justify-between gap-2 px-3.5 py-2 text-sm transition-colors",
                i === highlight && "bg-forest-50",
                option.value === current ? "font-semibold text-forest-800" : "text-ink"
              )}
            >
              <span className="truncate">{option.label}</span>
              {option.value === current && <Check className="h-4 w-4 shrink-0 text-forest-600" />}
            </li>
          ))}
        </ul>
      )}
      {!controlled && (
        <input type="hidden" name={name} value={current} aria-required={required} />
      )}
    </div>
  );
}
