import { Fragment, useEffect, useRef, useState, type FormEvent } from "react";
import type { DialogContent } from "../schemas";
import { useRuntime } from "../runtime";
import { ActionButton } from "./ActionButton";
import { Mark } from "./Mark";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Replace {field} placeholders, returning React nodes with values in <strong>. */
function fill(template: string, values: Record<string, string>, strong = false) {
  return template.split(/(\{[a-zA-Z0-9_-]+\})/g).map((part, i) => {
    const m = part.match(/^\{(.+)\}$/);
    if (!m) return <Fragment key={i}>{part}</Fragment>;
    const v = values[m[1]] ?? "";
    return strong ? <strong key={i}>{v}</strong> : <Fragment key={i}>{v}</Fragment>;
  });
}
const fillText = (t: string, v: Record<string, string>) =>
  t.replace(/\{([a-zA-Z0-9_-]+)\}/g, (_, k) => v[k] ?? "");

export function Dialog({ dialog, closeLabel }: { dialog: DialogContent; closeLabel: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { registerDialog, toast } = useRuntime();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<Record<string, string> | null>(null);
  const titleId = `dlg-${dialog.id}-title`;

  useEffect(
    () =>
      registerDialog(dialog.id, () => {
        const d = ref.current;
        if (!d) return;
        setDone(null);
        setErrors({});
        formRef.current?.reset();
        if (typeof d.showModal === "function") d.showModal();
        else d.setAttribute("open", "");
        requestAnimationFrame(() => d.querySelector<HTMLElement>("input, .btn")?.focus());
      }),
    [dialog.id, registerDialog],
  );

  useEffect(() => {
    if (done) ref.current?.querySelector<HTMLElement>(".done .btn")?.focus();
  }, [done]);

  const close = () => ref.current?.close();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const values: Record<string, string> = {};
    const next: Record<string, string> = {};
    for (const f of dialog.form.fields) {
      const v = String(data.get(f.name) ?? "").trim();
      values[f.name] = v;
      if (f.required && !v) next[f.name] = f.errors.required ?? "Required";
      else if (f.type === "email" && v && !EMAIL_RE.test(v)) next[f.name] = f.errors.invalid ?? "Invalid email";
    }
    setErrors(next);
    if (Object.keys(next).length) {
      requestAnimationFrame(() => form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
      return;
    }
    const success = dialog.form.success;
    if (success.type === "toast") {
      close();
      toast(fillText(success.message, values));
    } else {
      setDone(values);
    }
  };

  const success = dialog.form.success;

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClick={(e) => {
        if (e.target === ref.current) close();
      }}
    >
      <button type="button" className="close" aria-label={closeLabel} onClick={close}>
        ×
      </button>
      <div style={done ? { display: "none" } : undefined}>
        <div className="dlg-head">
          <Mark />
          <h2 id={titleId}>{dialog.title}</h2>
          {dialog.text && <p>{dialog.text}</p>}
        </div>
        <div className="stack">
          {dialog.actions.map((a, i) => (
            <ActionButton key={i} action={a} className="btn-block" />
          ))}
          {dialog.divider && <div className="or">{dialog.divider}</div>}
          <form ref={formRef} className="stack" noValidate onSubmit={onSubmit}>
            {dialog.form.fields.map((f) => (
              <Fragment key={f.name}>
                <label>
                  {f.label}
                  {f.type === "select" ? (
                    <select name={f.name}>
                      {(f.options ?? []).map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type}
                      name={f.name}
                      placeholder={f.placeholder}
                      autoComplete={f.autocomplete}
                      aria-invalid={errors[f.name] ? "true" : undefined}
                      onInput={() =>
                        errors[f.name] && setErrors(({ [f.name]: _, ...rest }) => rest)
                      }
                    />
                  )}
                </label>
                {f.type !== "select" && <p className="err">{errors[f.name] ?? ""}</p>}
              </Fragment>
            ))}
            <button className={`btn btn-${dialog.form.submit.variant} btn-block`} type="submit">
              {dialog.form.submit.label}
            </button>
            {dialog.form.note && (
              <p className="small" style={{ margin: "4px 0 0" }}>
                {dialog.form.note}
              </p>
            )}
          </form>
        </div>
      </div>
      {done && success.type === "done" && (
        <div className="done" role="status">
          <h2>{success.title}</h2>
          <p>{fill(success.text, done, true)}</p>
          <button type="button" className="btn btn-ghost" onClick={close}>
            {success.button}
          </button>
        </div>
      )}
    </dialog>
  );
}
