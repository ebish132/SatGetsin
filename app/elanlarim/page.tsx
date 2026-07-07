import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteListing, toggleListingStatus } from "./actions";
import type { Listing } from "@/lib/listings";

export default async function ElanlarimPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const items = (listings ?? []) as Listing[];

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Mənim elanlarım</h1>
        <Link
          href="/elan-yerlesdir/yeni"
          className="rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800"
        >
          Elan yerləşdir
        </Link>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-gray-500">Hələ elan yerləşdirməmisiniz.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((listing) => (
            <article
              key={listing.id}
              className="overflow-hidden rounded-xl border border-gray-200 bg-white"
            >
              <div className="relative aspect-4/3 w-full bg-gray-100">
                <Image
                  src={listing.images[0] ?? "https://placehold.co/400x300?text=Şəkil+yoxdur"}
                  alt={listing.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
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
                  {listing.price} AZN
                </p>
                <p className="mt-1 text-xs text-gray-500">{listing.city}</p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Link
                    href={`/elanlarim/${listing.id}`}
                    className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Redaktə et
                  </Link>

                  <form action={toggleListingStatus}>
                    <input type="hidden" name="id" value={listing.id} />
                    <input
                      type="hidden"
                      name="status"
                      value={listing.status === "active" ? "sold" : "active"}
                    />
                    <button
                      type="submit"
                      className="rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {listing.status === "active" ? "Satıldı et" : "Aktiv et"}
                    </button>
                  </form>

                  <form action={deleteListing}>
                    <input type="hidden" name="id" value={listing.id} />
                    <button
                      type="submit"
                      className="rounded-full border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                    >
                      Sil
                    </button>
                  </form>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
