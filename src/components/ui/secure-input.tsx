import * as React from "react"
import { Input } from "./input"
import { sanitizeInput } from "@/lib/validation"
import { cn } from "@/lib/utils"

interface SecureInputProps extends React.ComponentProps<"input"> {
  onSanitizedChange?: (value: string) => void;
  maxLength?: number;
  allowedChars?: RegExp;
}

const SecureInput = React.forwardRef<HTMLInputElement, SecureInputProps>(
  ({ className, onChange, onSanitizedChange, maxLength = 1000, allowedChars, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      let value = e.target.value;
      
      // Apply character restrictions
      if (allowedChars && !allowedChars.test(value)) {
        return; // Block invalid characters
      }
      
      // Apply length limit
      if (maxLength && value.length > maxLength) {
        value = value.substring(0, maxLength);
      }
      
      // Sanitize input
      const sanitizedValue = sanitizeInput(value);
      
      // Call original onChange if provided
      if (onChange) {
        const syntheticEvent = { 
          ...e, 
          target: { ...e.target, value: sanitizedValue } 
        };
        onChange(syntheticEvent);
      }
      
      // Call sanitized change handler
      if (onSanitizedChange) {
        onSanitizedChange(sanitizedValue);
      }
    };

    return (
      <Input
        className={cn("", className)}
        onChange={handleChange}
        ref={ref}
        {...props}
      />
    )
  }
)
SecureInput.displayName = "SecureInput"

export { SecureInput }