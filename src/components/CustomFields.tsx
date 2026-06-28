"use client";

import { Field, Input, Select } from "@/components/ui";

type ProjectField = App.Data.ProjectFieldData;

/**
 * Renders dynamic inputs for a project's custom fields and reports changes
 * via a { fieldId: value } map.
 */
export function CustomFields({
  fields,
  values,
  onChange,
}: {
  fields: ProjectField[];
  values: Record<number, unknown>;
  onChange: (fieldId: number, value: unknown) => void;
}) {
  const visible = fields.filter((f) => !f.isHidden);
  if (visible.length === 0) return null;

  return (
    <div className="space-y-3">
      {visible.map((field) => (
        <Field key={field.id} label={field.name}>
          <FieldInput field={field} value={values[field.id]} onChange={(v) => onChange(field.id, v)} />
        </Field>
      ))}
    </div>
  );
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: ProjectField;
  value: unknown;
  onChange: (value: unknown) => void;
}) {
  switch (field.type) {
    case "text":
      return <Input value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
    case "number":
      return (
        <Input
          type="number"
          value={(value as number | string) ?? ""}
          onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}
        />
      );
    case "datetime":
      return (
        <Input
          type="datetime-local"
          value={(value as string) ?? ""}
          onChange={(e) => onChange(e.target.value || null)}
        />
      );
    case "select":
      return (
        <Select value={(value as number | string) ?? ""} onChange={(e) => onChange(e.target.value === "" ? null : Number(e.target.value))}>
          <option value="">（未選択）</option>
          {field.options.map((o) => (
            <option key={o.id} value={o.id}>{o.label}</option>
          ))}
        </Select>
      );
    case "multiselect": {
      const selected = Array.isArray(value) ? (value as number[]) : [];
      const toggle = (id: number) =>
        onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id]);
      return (
        <div className="flex flex-wrap gap-2 rounded-md border border-gray-200 p-2">
          {field.options.map((o) => (
            <label key={o.id} className="flex items-center gap-1 text-sm">
              <input type="checkbox" checked={selected.includes(o.id)} onChange={() => toggle(o.id)} />
              {o.label}
            </label>
          ))}
        </div>
      );
    }
    default:
      return null;
  }
}
