interface InputProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}

export default function Input({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = false,
  autoComplete,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={name}
        className="text-sm font-medium text-foreground/70"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="px-3 py-2 rounded-lg bg-sea-deep border border-dock-border text-foreground placeholder:text-foreground/30 focus:outline-none focus:border-sea-accent transition-colors"
      />
    </div>
  );
}
