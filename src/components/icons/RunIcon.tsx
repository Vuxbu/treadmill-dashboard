export default function RunIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M13 3a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM4 21h4l1-5 4-3 4 3-2 5h5" />
      <path d="M6 12h4l2-3 4 2 4 5" />
    </svg>
  );
}
