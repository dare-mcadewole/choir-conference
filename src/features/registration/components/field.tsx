import { Children, cloneElement, isValidElement, useId } from "react";
import type { HTMLAttributes, ReactNode } from "react";

type FieldProps = {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  group?: boolean;
  children: ReactNode;
};

type ControlProps = HTMLAttributes<HTMLElement>;

export function Field({
  label,
  hint,
  error,
  group = false,
  children,
}: FieldProps) {
  const id = `field-${useId()}`;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  const controls = Children.map(children, (child) => {
    if (
      !isValidElement<ControlProps>(child) ||
      !["input", "select", "textarea"].includes(String(child.type))
    ) {
      return child;
    }

    return cloneElement(child, {
      id: child.props.id ?? id,
      "aria-describedby": [child.props["aria-describedby"], describedBy]
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
        <p
          id={errorId}
          role="alert"
          className="mt-1 text-sm font-normal text-red-700"
        >
          {error}
        </p>
      )}
    </>
  );

  if (group) {
    return (
      <fieldset
        className="block text-sm font-semibold text-slate-700"
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
      >
        <legend>{label}</legend>
        {controls}
        {description}
      </fieldset>
    );
  }

  return (
    <div className="block text-sm font-semibold text-slate-700">
      <label htmlFor={id}>{label}</label>
      {controls}
      {description}
    </div>
  );
}
