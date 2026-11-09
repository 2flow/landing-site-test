import type { Action } from "../schemas";
import { useRuntime } from "../runtime";

type Props = {
  action: Action;
  /** Extra classes, e.g. "btn-block". */
  className?: string;
  onClick?: () => void;
};

/**
 * Renders any content `action`:
 * - variant primary/ghost → button styling, otherwise a plain text link
 * - href → <a>, dialog/toast → <button>
 */
export function ActionButton({ action, className, onClick }: Props) {
  const { openDialog, toast } = useRuntime();
  const cls = [action.variant ? `btn btn-${action.variant}` : "link-btn", className]
    .filter(Boolean)
    .join(" ");

  if ("href" in action) {
    const external = /^https?:\/\//.test(action.href);
    return (
      <a
        className={action.variant ? cls : className}
        href={action.href}
        onClick={onClick}
        {...(external ? { rel: "noopener noreferrer", target: "_blank" } : {})}
      >
        {action.label}
      </a>
    );
  }

  return (
    <button
      type="button"
      className={cls}
      onClick={() => {
        onClick?.();
        if ("dialog" in action) openDialog(action.dialog);
        else toast(action.toast);
      }}
    >
      {action.label}
    </button>
  );
}
