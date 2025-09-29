"use client";

import { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from "react";

type CommonProps = {
  variant?: "primary" | "secondary" | "outlined" | "destructive";
  asLink?: boolean;
  mt?: "none" | "xs" | "sm" | "md" | "lg" | "xlg";
  size?: "xs" | "sm" | "md" | "lg" | "xlg";
  w?: "auto" | "full";
  loading?: boolean;
  children: ReactNode;
};

type ButtonProps =
  | (CommonProps & ButtonHTMLAttributes<HTMLButtonElement>)
  | (CommonProps & AnchorHTMLAttributes<HTMLAnchorElement>);

export default function Button({
  children,
  variant = "primary",
  asLink = false,
  mt = "none",
  size = "md",
  w = "auto",
  loading = false,
  ...props
}: ButtonProps) {
  const baseClass =
    "rounded font-semibold hover:scale-105 cursor-pointer transition flex items-center justify-center gap-2";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover",
    secondary: "text-primary",
    outlined: "text-primary border hover:bg-secondary-hover",
    destructive: "bg-red-500 text-white hover:bg-red-600",
  };

  const marginTopMap = {
    none: "mt-0",
    xs: "mt-1",
    sm: "mt-2",
    md: "mt-4",
    lg: "mt-6",
    xlg: "mt-8",
  };

  const sizeMap = {
    xs: "px-2 py-1 text-xs",
    sm: "px-3 py-2 text-sm",
    md: "px-6 py-3 text-lg",
    lg: "px-8 py-4 text-lg",
    xlg: "px-10 py-5 text-2xl",
  };

  const widthMap = {
    auto: "w-auto",
    full: "w-full",
  };

  const className = `${baseClass} ${variants[variant]} ${marginTopMap[mt]} ${
    sizeMap[size]
  } ${widthMap[w]} ${loading ? "opacity-70 cursor-not-allowed" : ""}`;

  const Spinner = () => (
    <svg
      className="animate-spin h-5 w-5 text-white"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      ></circle>
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      ></path>
    </svg>
  );

  const content = loading ? <Spinner /> : children;

  if (asLink) {
    return (
      <a
        className={className}
        {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      className={className}
      type={(props as ButtonHTMLAttributes<HTMLButtonElement>).type || "button"}
      disabled={
        loading || (props as ButtonHTMLAttributes<HTMLButtonElement>).disabled
      }
      {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
}
