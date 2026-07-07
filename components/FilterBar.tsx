"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { categories } from "@/lib/categories";
import { cities } from "@/lib/cities";

export default function FilterBar() {
  const router = useRouter();
  const params = useSearchParams();

  const [category, setCategory] = useState(params.get("category") ?? "");
  const [city, setCity] = useState(params.get("city") ?? "");
  const [minPrice, setMinPrice] = useState(params.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(params.get("max") ?? "");

  function apply() {
    const next = new URLSearchParams(params.toString());
    const set = (key: string, value: string) => {
      if (value) next.set(key, value);
      else next.delete(key);
    };
    set("category", category);
    set("city", city);
    set("min", minPrice);
    set("max", maxPrice);
    router.push(`/?${next.toString()}`);
  }

  function reset() {
    setCategory("");
    setCity("");
    setMinPrice("");
    setMaxPrice("");
    const next = new URLSearchParams();
    const q = params.get("q");
    if (q) next.set("q", q);
    router.push(next.toString() ? `/?${next.toString()}` : "/");
  }

  const hasFilters = category || city || minPrice || maxPrice;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-3">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
        >
          <option value="">Bütün kateqoriyalar</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.icon} {c.name}
            </option>
          ))}
        </select>

        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
        >
          <option value="">Bütün şəhərlər</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <input
          type="number"
          inputMode="numeric"
          placeholder="Min qiymət"
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder="Max qiymət"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
        />
      </div>

      <div className="mt-2 flex gap-2">
        <button
          onClick={apply}
          className="rounded-full bg-green-700 px-5 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Axtar
        </button>
        {hasFilters && (
          <button
            onClick={reset}
            className="rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
          >
            Təmizlə
          </button>
        )}
      </div>
    </div>
  );
}
