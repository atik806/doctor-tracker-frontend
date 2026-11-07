"use client";

import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";
import { inputClasses } from "./TextField";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}

const DEBOUNCE_MS = 400;

/**
 * Search box that waits until the user stops typing before calling onChange,
 * so we don't send a request on every keystroke.
 */
export function SearchInput({ value, onChange, placeholder, className = "" }: SearchInputProps) {
  const [text, setText] = useState(value);
  const [lastValue, setLastValue] = useState(value);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // If the parent changes the value (e.g. "Clear filters"), show the new value.
  // This is React's recommended way to sync state with a prop without an effect.
  if (value !== lastValue) {
    setLastValue(value);
    setText(value);
  }

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  function handleChange(nextText: string) {
    setText(nextText);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(nextText.trim()), DEBOUNCE_MS);
  }

  function handleClear() {
    if (timer.current) clearTimeout(timer.current);
    setText("");
    onChange("");
  }

  return (
    <div className={`relative ${className}`}>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-subtle" aria-hidden />
      <input
        type="search"
        value={text}
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className={`${inputClasses} border-border pr-9 pl-9 [&::-webkit-search-cancel-button]:hidden`}
      />
      {text && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-subtle hover:bg-surface-muted hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  );
}
