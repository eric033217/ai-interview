import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2.5" aria-label="Rehearse 首頁">
      <span className="relative grid size-8 place-items-center rounded-lg bg-ink text-paper transition-transform group-hover:-rotate-6">
        <svg viewBox="0 0 24 24" className="size-4" fill="none" aria-hidden="true">
          <path
            d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v7a2.5 2.5 0 0 1-2.5 2.5H10l-4 4v-4h0.5A2.5 2.5 0 0 1 4 13.5v-7Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
        <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-accent ring-2 ring-paper" />
      </span>
      <span className="font-display text-2xl leading-none tracking-tight">Rehearse</span>
    </Link>
  );
}
