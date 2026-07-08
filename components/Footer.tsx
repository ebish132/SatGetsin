export default function Footer() {
  return (
    <footer className="mt-auto border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-500">
        <p>
          VerGetsin — Azərbaycanda ikinci əl əşyaların alqı-satqı platforması.
        </p>
        <p className="mt-1">
          © {new Date().getFullYear()} VerGetsin. Bütün hüquqlar qorunur.
        </p>
      </div>
    </footer>
  );
}
