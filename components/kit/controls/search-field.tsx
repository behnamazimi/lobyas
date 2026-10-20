import { Search, X } from "lucide-react";
import type { Ref } from "react";
import { cn } from "@/lib/utils";

/** A white 48 px search field with a clear button. Forward `inputRef` to focus it from a shortcut. */
export function SearchField({
  value,
  onChange,
  label,
  placeholder = label,
  inputRef,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  placeholder?: string;
  inputRef?: Ref<HTMLInputElement>;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-12 items-center gap-2 rounded-2xl bg-base-100 pr-1 pl-3.5 shadow-card",
        className,
      )}
    >
      <Search className="size-[18px] shrink-0 text-muted" strokeWidth={2.4} aria-hidden />
      <input
        ref={inputRef}
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 min-w-0 flex-1 appearance-none border-0 bg-transparent text-[15px] font-semibold outline-none placeholder:text-muted [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="flex size-11 shrink-0 items-center justify-center rounded-full text-muted"
        >
          <X className="size-4" strokeWidth={2.6} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}
