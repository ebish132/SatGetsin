import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col items-center justify-center px-4 py-24 text-center">
      <p className="text-5xl">🧐</p>
      <h1 className="mt-4 text-xl font-semibold text-gray-900">
        Səhifə tapılmadı
      </h1>
      <p className="mt-2 text-sm text-gray-500">
        Axtardığınız səhifə mövcud deyil və ya silinib.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800"
      >
        Ana səhifəyə qayıt
      </Link>
    </main>
  );
}
