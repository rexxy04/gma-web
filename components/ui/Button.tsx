"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Definisi varian style
const variants = {
  primary: "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-900/20 border-transparent",
  secondary: "bg-white text-slate-900 hover:bg-gray-50 border-gray-200 border shadow-sm",
  outline: "bg-transparent border border-white/20 text-white hover:bg-white/10",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent",
  glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20", // Khusus Hero/Dark BG
  danger: "bg-red-600 text-white hover:bg-red-700 border-transparent",
};

const sizes = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-3 text-base",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, leftIcon, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={props.disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center rounded-full font-semibold transition-all duration-200 active:scale-95 disabled:opacity-70 disabled:pointer-events-none",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && <span className="mr-2">{leftIcon}</span>}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export default Button;