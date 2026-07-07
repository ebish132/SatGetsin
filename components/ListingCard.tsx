import Image from "next/image";
import Link from "next/link";
import type { Listing } from "@/lib/listings";

export default function ListingCard({ listing }: { listing: Listing }) {
  const cover =
    listing.images?.[0] ?? "https://placehold.co/400x300?text=Şəkil+yoxdur";

  return (
    <Link
      href={`/elan/${listing.id}`}
      className={`group block ${
        listing.promotion_tier === "vip"
          ? "rounded-xl ring-2 ring-amber-400"
          : ""
      }`}
    >
      <article className="overflow-hidden rounded-xl border border-gray-200 bg-white transition group-hover:shadow-md">
        <div className="relative aspect-4/3 w-full bg-gray-100">
          <Image
            src={cover}
            alt={listing.title}
            fill
            className="object-cover transition group-hover:scale-[1.02]"
            unoptimized
          />
          {listing.promotion_tier === "vip" && (
            <span className="vip-badge absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              ⭐ VIP
            </span>
          )}
          {listing.promotion_tier === "sade" && (
            <span className="absolute left-2 top-2 inline-flex items-center gap-0.5 rounded-full bg-green-600 px-2 py-0.5 text-[10px] font-bold text-white shadow">
              🔼 Önə çıxan
            </span>
          )}
          {listing.status === "sold" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
              <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-gray-900">
                Satıldı
              </span>
            </div>
          )}
        </div>
        <div className="p-3">
          <h3 className="line-clamp-1 text-sm font-medium text-gray-900">
            {listing.title}
          </h3>
          <p className="mt-1 text-base font-bold text-green-700">
            {listing.price.toLocaleString("az")} AZN
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
            <span>📍</span>
            {listing.city}
          </p>
        </div>
      </article>
    </Link>
  );
}
