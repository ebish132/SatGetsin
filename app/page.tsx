import CategoryNav from "@/components/CategoryNav";
import FilterBar from "@/components/FilterBar";
import ListingCard from "@/components/ListingCard";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/lib/categories";
import type { Listing } from "@/lib/listings";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    category?: string;
    city?: string;
    min?: string;
    max?: string;
  }>;
}) {
  const { q, category, city, min, max } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .order("promotion_tier", { ascending: false })
    .order("created_at", { ascending: false });

  if (q) query = query.ilike("title", `%${q}%`);
  if (category) query = query.eq("category", category);
  if (city) query = query.eq("city", city);
  if (min) query = query.gte("price", Number(min));
  if (max) query = query.lte("price", Number(max));

  const { data } = await query;
  const listings = (data ?? []) as Listing[];

  const activeCategory = categories.find((c) => c.slug === category);
  const heading = q
    ? `"${q}" üçün nəticələr`
    : activeCategory
      ? activeCategory.name
      : "Son elanlar";

  const isDefaultView = !q && !activeCategory && !city && !min && !max;

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      {isDefaultView && (
        <p className="mb-4 text-sm text-gray-600">
          VerGetsin — Azərbaycanda{" "}
          <strong className="font-semibold text-gray-800">
            ikinci əl əşyaların alqı-satqı
          </strong>{" "}
          platforması. Elektronika, geyim, ev əşyaları, nəqliyyat və daha çoxunu
          pulsuz elanla al və sat.
        </p>
      )}

      <CategoryNav active={category} />

      <div className="mt-4">
        <FilterBar />
      </div>

      <div className="mt-6 mb-4 flex items-baseline justify-between">
        <h1 className="text-lg font-semibold text-gray-900">
          {isDefaultView ? "İkinci əl elanlar" : heading}
        </h1>
        <span className="text-sm text-gray-500">{listings.length} elan</span>
      </div>

      {listings.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <p className="text-4xl">🔍</p>
          <p className="mt-3 text-sm font-medium text-gray-700">
            Elan tapılmadı
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Axtarış şərtlərini dəyişin və ya ilk elanı siz yerləşdirin.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </main>
  );
}
