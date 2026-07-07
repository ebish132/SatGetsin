import Link from "next/link";
import { categories } from "@/lib/categories";

export default function CategoryNav({ active }: { active?: string }) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      <Link
        href="/"
        className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
          !active
            ? "border-green-600 bg-green-50 text-green-700"
            : "border-gray-200 bg-white text-gray-700 hover:border-green-600 hover:text-green-700"
        }`}
      >
        Hamısı
      </Link>
      {categories.map((category) => {
        const isActive = active === category.slug;
        return (
          <Link
            key={category.slug}
            href={`/?category=${category.slug}`}
            className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              isActive
                ? "border-green-600 bg-green-50 text-green-700"
                : "border-gray-200 bg-white text-gray-700 hover:border-green-600 hover:text-green-700"
            }`}
          >
            <span>{category.icon}</span>
            {category.name}
          </Link>
        );
      })}
    </div>
  );
}
