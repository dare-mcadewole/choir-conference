"use client";

import type { FocusEventHandler, Ref } from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type PickerOption = {
  label: string;
  value: string;
};

type PickerProps = {
  list: readonly (string | PickerOption)[];
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  onBlur?: FocusEventHandler<HTMLButtonElement>;
  inputRef?: Ref<HTMLInputElement>;
  id?: string;
  name?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean | "true" | "false";
};

export function Picker({
  list,
  value,
  defaultValue,
  onValueChange,
  onBlur,
  inputRef,
  id,
  name,
  placeholder = "Select an option",
  required,
  disabled,
  className,
  "aria-describedby": ariaDescribedBy,
  "aria-invalid": ariaInvalid,
}: PickerProps) {
  const items = list.map((item) =>
    typeof item === "string" ? { label: item, value: item } : item,
  );

  return (
    <Select
      items={items}
      value={value}
      defaultValue={defaultValue}
      onValueChange={onValueChange}
      inputRef={inputRef}
      name={name}
      required={required}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        onBlur={onBlur}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid}
        className={cn(
          "h-10 w-full rounded-md border-[0.5px] bg-background px-3 text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/20",
          className,
        )}
      >
        <SelectValue
          placeholder={placeholder}
          className="truncate data-[placeholder]:text-muted-foreground"
        />
      </SelectTrigger>
      <SelectContent
        align="start"
        className="border-hairline border-border shadow-xl"
      >
        {items.map(({ label, value: itemValue }) => (
          <SelectItem key={itemValue} value={itemValue}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
