import { InputHTMLAttributes, forwardRef, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, id, ...props }, ref) => (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-muted2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={`w-full bg-bg border border-border rounded-lg px-4 py-3.5 text-sm font-medium text-text placeholder-muted outline-none transition-all duration-200 focus:border-accent/60 focus:bg-bg2 focus:shadow-[0_0_15px_rgba(99,102,241,0.1)] ${className}`}
        {...props}
      />
    </div>
  )
);

Input.displayName = "Input";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", label, id, options, ...props }, ref) => (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-muted2">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={id}
        className={`w-full bg-bg border border-border rounded-lg px-4 py-3.5 text-sm font-medium text-text outline-none transition-all duration-200 focus:border-accent/60 focus:bg-bg2 focus:shadow-[0_0_15px_rgba(99,102,241,0.1)] appearance-none cursor-pointer ${className}`}
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%235a6480' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 1rem center",
        }}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
);

Select.displayName = "Select";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", label, id, ...props }, ref) => (
    <div className="flex flex-col gap-2">
      {label && (
        <label htmlFor={id} className="text-xs font-bold uppercase tracking-widest text-muted2">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={`w-full bg-bg border border-border rounded-lg px-4 py-3.5 text-sm font-medium text-text placeholder-muted outline-none transition-all duration-200 focus:border-accent/60 focus:bg-bg2 focus:shadow-[0_0_15px_rgba(99,102,241,0.1)] resize-none ${className}`}
        {...props}
      />
    </div>
  )
);

Textarea.displayName = "Textarea";
