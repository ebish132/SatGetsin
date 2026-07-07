import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ImageGallery from "@/components/ImageGallery";
import { startConversation } from "@/app/mesajlar/actions";
import { createClient } from "@/lib/supabase/server";
import { categories } from "@/lib/categories";
import type { Listing } from "@/lib/listings";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("az-AZ", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("listings")
    .select("title, description, price, city, images")
    .eq("id", id)
    .single();

  if (!listing) {
    return { title: "Elan tapılmadı" };
  }

  const title = `${listing.title} - ${listing.price.toLocaleString("az")} AZN`;
  const description =
    listing.description?.slice(0, 160) ||
    `${listing.title} - ${listing.city}-da satılır. ${listing.price.toLocaleString("az")} AZN.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: listing.images?.[0] ? [listing.images[0]] : undefined,
    },
  };
}

export default async function ElanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .single();

  if (!listing) {
    notFound();
  }

  const l = listing as Listing;

  const { data: seller } = await supabase
    .from("profiles")
    .select("full_name, phone, city, avatar_url")
    .eq("id", l.user_id)
    .single();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwner = user?.id === l.user_id;
  const categoryName =
    categories.find((c) => c.slug === l.category)?.name ?? l.category;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-6">
      <Link
        href="/"
        className="mb-4 inline-block text-sm text-gray-500 hover:text-gray-700"
      >
        ← Geri
      </Link>

      <div className="grid gap-6 md:grid-cols-[1.4fr_1fr]">
        <div>
          <ImageGallery images={l.images} title={l.title} />

          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4">
            <h2 className="text-sm font-semibold text-gray-900">Təsvir</h2>
            <p className="mt-2 whitespace-pre-line text-sm text-gray-700">
              {l.description || "Təsvir əlavə edilməyib."}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4 text-sm">
              <div>
                <dt className="text-gray-500">Kateqoriya</dt>
                <dd className="font-medium text-gray-800">{categoryName}</dd>
              </div>
              {l.subcategory && (
                <div>
                  <dt className="text-gray-500">Növ</dt>
                  <dd className="font-medium text-gray-800">{l.subcategory}</dd>
                </div>
              )}
              <div>
                <dt className="text-gray-500">Şəhər</dt>
                <dd className="font-medium text-gray-800">{l.city}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Tarix</dt>
                <dd className="font-medium text-gray-800">
                  {formatDate(l.created_at)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h1 className="text-lg font-semibold text-gray-900">{l.title}</h1>
            <p className="mt-2 text-2xl font-bold text-green-700">
              {l.price.toLocaleString("az")} AZN
            </p>
            {l.status === "sold" && (
              <span className="mt-2 inline-block rounded-full bg-gray-200 px-3 py-1 text-xs font-semibold text-gray-700">
                Satıldı
              </span>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-900">Satıcı</h2>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-lg font-semibold text-gray-400">
                {seller?.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={seller.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (seller?.full_name?.[0] ?? "?").toUpperCase()
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {seller?.full_name || "İstifadəçi"}
                </p>
                {seller?.city && (
                  <p className="text-xs text-gray-500">{seller.city}</p>
                )}
              </div>
            </div>

            {seller?.phone && (
              <a
                href={`tel:${seller.phone}`}
                className="mt-4 block rounded-full border border-gray-300 py-2 text-center text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                📞 {seller.phone}
              </a>
            )}

            {isOwner ? (
              <Link
                href={`/elanlarim/${l.id}`}
                className="mt-2 block rounded-full bg-green-700 py-2 text-center text-sm font-medium text-white hover:bg-green-800"
              >
                Elanı redaktə et
              </Link>
            ) : (
              <form action={startConversation} className="mt-2">
                <input type="hidden" name="listingId" value={l.id} />
                <input type="hidden" name="sellerId" value={l.user_id} />
                <button
                  type="submit"
                  className="w-full rounded-full bg-green-700 py-2 text-sm font-medium text-white hover:bg-green-800"
                >
                  💬 Satıcıya mesaj yaz
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
