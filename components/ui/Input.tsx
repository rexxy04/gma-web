"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: React.ReactNode; // Icon sebelah kiri
  rightElement?: React.ReactNode; // Tombol/Icon sebelah kanan (misal: mata password)
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, icon, rightElement, error, ...props }, ref) => {
    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={props.id} className="text-sm font-medium text-slate-700">
            {label}
          </label>
        )}
        
        <div className="relative group">
          {/* Left Icon Wrapper */}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            className={cn(
              "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 transition-all",
              "placeholder:text-slate-400",
              "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200",
              "disabled:cursor-not-allowed disabled:opacity-50",
              icon && "pl-10", // Tambah padding kiri jika ada icon
              rightElement && "pr-10", // Tambah padding kanan jika ada elemen kanan
              error && "border-red-500 focus:ring-red-200",
              className
            )}
            {...props}
          />

          {/* Right Element Wrapper (misal: toggle password) */}
          {rightElement && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
              {rightElement}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";

export default Input;