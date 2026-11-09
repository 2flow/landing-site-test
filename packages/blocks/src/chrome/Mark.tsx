/**
 * Brand mark. For now the Moon HQ ring is built in; when a second site
 * needs a different mark, move this to a per-site SVG in sites/<site>/.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 128 80" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M0 40a64 40 0 1 0 128 0a64 40 0 1 0 -128 0Z M20 36a48 30 0 1 0 96 0a48 30 0 1 0 -96 0Z"
      />
    </svg>
  );
}
