export function Logo({ claro = false, className = "" }: { claro?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 font-bold tracking-tight ${className}`}>
      <svg viewBox="0 0 64 64" className="h-8 w-8 shrink-0" aria-hidden>
        <rect width="64" height="64" rx="14" fill={claro ? "#ffffff" : "#0b3b60"} />
        <path d="M14 18h22l14 14-14 14H14z" fill="#13a05a" />
        <circle cx="22" cy="32" r="4" fill="#fff" />
      </svg>
      <span className={`text-lg ${claro ? "text-white" : "text-marca"}`}>
        Tag <span className={claro ? "text-emerald-300" : "text-destaque"}>Brasil</span>
      </span>
    </span>
  );
}
