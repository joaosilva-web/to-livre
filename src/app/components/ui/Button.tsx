import { ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";

// Tipos possíveis de botão ou link
type CommonProps = {
  variant?: "primary" | "secondary" | "outlined";
  asLink?: boolean;
  mt?: "none" | "xs" | "sm" | "md" | "lg" | "xlg";
  size?: "xs" | "sm" | "md" | "lg" | "xlg";
  w?: "auto" | "full";
};

// União de tipos com base na tag
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
  ...props
}: ButtonProps) {
  const baseClass =
    "rounded-full font-semibold hover:scale-105 cursor-pointer transition";

  const variants = {
    primary: "bg-primary text-white hover:bg-primary-hover",
    secondary: "text-primary",
    outlined: "text-primary border hover:bg-secondary-hover",
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
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-lg",
    lg: "px-8 py-4 text-lg",
    xlg: "px-10 py-5 text-2xl",
  };

  const widthMap = {
    auto: "w-auto",
    full: "w-full",
  };

  const className = `${baseClass} ${variants[variant]} ${marginTopMap[mt]} ${sizeMap[size]} ${widthMap[w]}`;

  if (asLink) {
    return (
      <div className="flex flex-col sm:flex-row justify-center">
        <a
          className={className}
          {...(props as AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {children}
        </a>
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row justify-center">
      <button
        className={className}
        type={
          (props as ButtonHTMLAttributes<HTMLButtonElement>).type || "button"
        }
        {...(props as ButtonHTMLAttributes<HTMLButtonElement>)}
      >
        {children}
      </button>
    </div>
  );
}
