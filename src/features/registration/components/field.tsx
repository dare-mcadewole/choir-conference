import { CircleExclamationPoint } from "lucide-react";
import { Children, cloneElement, isValidElement, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";

type FieldProps = {
  id?: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  group?: boolean;
  children: ReactNode;
};

type ControlProps = HTMLAttributes<HTMLElement>;

const labelClassname =
  "inline-block mb-1 text-xs uppercase font-semibold tracking-wider";

export function Field({
  id,
  label,
  hint,
  error,
  group = false,
  children,
}: FieldProps) {
  const generatedId = useId();
  const fieldId = id ?? `field-${generatedId}`;
  const hintId = hint ? `${fieldId}-hint` : undefined;
  const errorId = error ? `${fieldId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const controls = Children.map(children, (child) => {
    if (!isValidElement<ControlProps>(child)) {
      return child;
    }

    const nativeControl =
      typeof child.type === "string" &&
      ["input", "select", "textarea"].includes(child.type);
    const customControl = typeof child.type === "function";
    if (!nativeControl && !customControl) return child;

    return cloneElement(child, {
      id: child.props.id ?? fieldId,
      "aria-describedby":
        [child.props["aria-describedby"], describedBy]
          .filter(Boolean)
          .join(" ") || undefined,
      "aria-invalid": error ? true : child.props["aria-invalid"],
    });
  });

  const description = (
    <>
      {hint && (
        <p id={hintId} className="mt-1 text-xs font-normal text-slate-500">
          {hint}
        </p>
      )}
      {error && (
        <div
          id={errorId}
          role="alert"
          className="
            flex items-center gap-1 mt-1 text-[13px] font-normal text-red-600
          "
        >
          <CircleExclamationPoint size={14} />
          <span>{error}</span>
        </div>
      )}
    </>
  );

  if (group) {
    return (
      <fieldset
        className="block text-sm text-slate-700"
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
      >
        <legend className={labelClassname}>{label}</legend>
        {controls}
        {description}
      </fieldset>
    );
  }

  return (
    <div className="block text-sm text-slate-700">
      <label htmlFor={fieldId} className={labelClassname}>
        {label}
      </label>
      {controls}
      {description}
    </div>
  );
}
