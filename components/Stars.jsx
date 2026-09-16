export default function Stars({ value, size = 14, className = "" }) {
  const full = Math.round(value);
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          width={size}
          height={size}
          viewBox="0 0 20 20"
          aria-hidden
          className={i <= full ? "text-accent" : "text-line"}
        >
          <path
            d="M10 1.8l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L2.2 7.5l5.4-.8z"
            fill="currentColor"
          />
        </svg>
      ))}
    </span>
  );
}
