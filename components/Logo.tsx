import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/" className="group flex items-center gap-2 select-none">
      <span className="logo-badge relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-700 text-white shadow-sm ring-1 ring-green-800/10 transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-5 w-5"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0l-7.17-7.17a2 2 0 0 1-.58-1.41V5a2 2 0 0 1 2-2h6.99a2 2 0 0 1 1.41.58l7.17 7.17a2 2 0 0 1 0 2.83Z" />
          <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" stroke="none" />
        </svg>
      </span>
      <span className="text-xl font-extrabold tracking-tight">
        <span className="text-gray-900">Sat</span>
        <span className="bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
          Getsin
        </span>
      </span>
    </Link>
  );
}
