export function BrandLogo() {
  return (
    <span className="brand-logo" aria-hidden="true">
      <svg viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="12" fill="#172b49" />
        <path
          d="M9 19 20 9l11 10"
          stroke="#7eacff"
          strokeWidth="2.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M13 28V19h7.5c5 0 5 6 0 6H16m5-1 5 5"
          stroke="white"
          strokeWidth="2.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="30" cy="10" r="3" fill="#f6c56c" />
      </svg>
    </span>
  );
}
