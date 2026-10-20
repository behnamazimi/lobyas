import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/utils";

const FIELD =
  "block w-full rounded-[14px] border-0 bg-base-200 px-3.5 text-[15px] font-bold text-base-content outline-none placeholder:font-semibold placeholder:text-muted focus-visible:ring-2 focus-visible:ring-base-content";

/** A label above a field. Pass the same `htmlFor` as the field's `id`. */
export function FormField({
  label,
  htmlFor,
  className,
  children,
}: {
  label: ReactNode;
  htmlFor?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-extrabold">
        {label}
      </label>
      {children}
    </div>
  );
}

/** A cream 48 px text field. */
export function TextInput({ className, ...rest }: ComponentProps<"input">) {
  return <input type="text" className={cn(FIELD, "h-12", className)} {...rest} />;
}

/** A cream multi-line field. */
export function TextArea({ className, ...rest }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(FIELD, "resize-none py-3 leading-snug font-semibold", className)}
      {...rest}
    />
  );
}

/** A cream 48 px native select. */
export function SelectInput({ className, ...rest }: ComponentProps<"select">) {
  return <select className={cn(FIELD, "h-12", className)} {...rest} />;
}
