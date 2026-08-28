interface FormFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
}

export function FormField({
  label,
  name,
  value,
  onChange,
  type = "text",
  required = false,
}: FormFieldProps) {
  return (
    <label className="grid gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
      {label}
      <input
        name={name}
        value={value}
        required={required}
        type={type}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-sm border border-border bg-background px-3 text-sm normal-case tracking-normal text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}
