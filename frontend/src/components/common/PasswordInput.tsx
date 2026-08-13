import {
  forwardRef,
 type InputHTMLAttributes,
  useState,
} from "react";

import { Eye, EyeOff } from "lucide-react";

import Input from "./Input";

interface PasswordInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "type"
  > {
  label?: string;
  error?: string;
  helperText?: string;
  required?: boolean;
  containerClassName?: string;
}

const PasswordInput = forwardRef<
  HTMLInputElement,
  PasswordInputProps
>(
  (
    {
      label,
      error,
      helperText,
      required,
      containerClassName,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] =
      useState(false);

    return (
      <Input
        ref={ref}
        type={
          showPassword
            ? "text"
            : "password"
        }
        label={label}
        error={error}
        helperText={helperText}
        required={required}
        containerClassName={
          containerClassName
        }
        rightIcon={
          <button
            type="button"
            onClick={() =>
              setShowPassword(
                (prev) => !prev
              )
            }
            className="cursor-pointer text-slate-500 hover:text-slate-700"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        }
        {...props}
      />
    );
  }
);

PasswordInput.displayName =
  "PasswordInput";

export default PasswordInput;