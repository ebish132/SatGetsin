import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ConversationRow = {
  id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  listings: {
    title: string;
    images: string[];
    price: number;
  } | null;
};

export default async function MesajlarPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/mesajlar");
  }

  const { data } = await supabase
    .from("conversations")
    .select("id, buyer_id, seller_id, created_at, listings(title, images, price)")
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const conversations = (data ?? []) as unknown as ConversationRow[];

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-900">Mesajlar</h1>

      {conversations.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white py-16 text-center">
          <p className="text-4xl">💬</p>
          <p className="mt-3 text-sm text-gray-500">Hələ mesajınız yoxdur.</p>
        </div>
      ) : (
        <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
          {conversations.map((c) => {
            const role = c.buyer_id === user.id ? "Alıcı" : "Satıcı";
            const cover =
              c.listings?.images?.[0] ??
              "https://placehold.co/100x100?text=?";
            return (
              <Link
                key={c.id}
                href={`/mesajlar/${c.id}`}
                className="flex items-center gap-3 p-3 hover:bg-gray-50"
              >
                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  <Image
                    src={cover}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-1 text-sm font-medium text-gray-900">
                    {c.listings?.title ?? "Silinmiş elan"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {c.listings?.price?.toLocaleString("az")} AZN · {role}
                  </p>
                </div>
                <span className="text-gray-300">›</span>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
