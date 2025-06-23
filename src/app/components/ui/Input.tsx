"use client";

import { InputHTMLAttributes } from "react";
import { FieldError } from "react-hook-form";

type CommonProps = {
  label?: string;
  variant?: "primary" | "flushed";
  error?: FieldError;
};

type InputProps = CommonProps & InputHTMLAttributes<HTMLInputElement>;

export default function Input({
  label,
  variant = "primary",
  error,
  ...props
}: InputProps) {
  const baseClass =
    "w-full px-4 py-2 transition text-text-secondary focus:outline-none";

  const variantClassMap = {
    primary: "rounded-md border-2",
    flushed: "border-b-2 border-x-0 border-t-0 rounded-none",
  };

  const errorClass = error
    ? "border-feedback-error focus:border-feedback-error"
    : "border-gray-300 focus:border-primary";
  const inputClass = `${baseClass} ${variantClassMap[variant]} ${errorClass}`;

  return (
    <div>
      {label && (
        <label className="block mb-1 text-text-secondary font-medium">
          {label}
        </label>
      )}
      <input
        className={inputClass}
        {...(props as InputHTMLAttributes<HTMLInputElement>)}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error.message}</p>}
    </div>
  );
}
