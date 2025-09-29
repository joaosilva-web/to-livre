"use client";

import * as SelectPrimitive from "@radix-ui/react-select";
import { ChevronDown, ChevronUp } from "lucide-react";

type CommonProps = {
  variant?: "primary" | "secondary" | "outlined";
  size?: "xs" | "sm" | "md" | "lg" | "xlg";
  mt?: "none" | "xs" | "sm" | "md" | "lg" | "xlg";
  w?: "auto" | "full";
};

type SelectProps = CommonProps & {
  options: { label: string; value: string }[];
  placeholder?: string;
  defaultValue?: string;
  value?: string;
  // onValueChange is kept for existing usage; onChange is an alias used across the codebase
  onValueChange?: (value: string) => void;
  onChange?: (value: string) => void;
  disabled?: boolean;
};

export default function Select({
  options,
  placeholder = "Selecione...",
  variant = "outlined",
  size = "md",
  mt = "none",
  w = "auto",
  defaultValue,
  onValueChange,
  value,
  onChange,
  disabled,
}: SelectProps) {
  const baseClass =
    "flex items-center justify-between rounded font-medium transition cursor-pointer";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover",
    secondary: "text-primary",
    outlined: "border-2 border-gray-300 text-text-secondary rounded-md",
  };

  const sizeMap = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xlg: "px-8 py-4 text-xl",
  };

  const marginTopMap = {
    none: "mt-0",
    xs: "mt-1",
    sm: "mt-2",
    md: "mt-4",
    lg: "mt-6",
    xlg: "mt-8",
  };

  const widthMap = {
    auto: "w-auto",
    full: "w-full",
  };

  const className = `${baseClass} ${variants[variant]} ${sizeMap[size]} ${marginTopMap[mt]} ${widthMap[w]}`;

  return (
    <SelectPrimitive.Root
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange ?? onChange}
    >
      <SelectPrimitive.Trigger className={className} disabled={disabled}>
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon>
          <ChevronDown className="w-4 h-4" />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Content className="bg-white border border-gray-200 rounded shadow-lg">
          <SelectPrimitive.ScrollUpButton className="flex items-center justify-center h-6">
            <ChevronUp className="w-4 h-4" />
          </SelectPrimitive.ScrollUpButton>

          <SelectPrimitive.Viewport className="p-2">
            {options.map((opt) => (
              <SelectPrimitive.Item
                key={opt.value}
                value={opt.value}
                className="cursor-pointer px-3 py-2 rounded text-text-secondary hover:bg-primary-light hover:text-primary"
              >
                <SelectPrimitive.ItemText>{opt.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>

          <SelectPrimitive.ScrollDownButton className="flex items-center justify-center h-6">
            <ChevronDown className="w-4 h-4" />
          </SelectPrimitive.ScrollDownButton>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}
