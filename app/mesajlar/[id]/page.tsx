import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import MessageComposer from "@/components/MessageComposer";
import { createClient } from "@/lib/supabase/server";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

function formatTime(iso: string) {
  return new Date(iso).toLocaleString("az-AZ", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/mesajlar/${id}`);
  }

  const { data: conversation } = await supabase
    .from("conversations")
    .select("id, buyer_id, seller_id, listing_id, listings(title, images, price)")
    .eq("id", id)
    .single();

  if (!conversation) {
    notFound();
  }

  const otherId =
    conversation.buyer_id === user.id
      ? conversation.seller_id
      : conversation.buyer_id;

  const { data: other } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", otherId)
    .single();

  const { data: messagesData } = await supabase
    .from("messages")
    .select("id, sender_id, content, created_at")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const messages = (messagesData ?? []) as Message[];
  const listing = conversation.listings as unknown as {
    title: string;
    images: string[];
    price: number;
  } | null;
  const cover = listing?.images?.[0] ?? "https://placehold.co/100x100?text=?";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 py-6">
      <Link
        href="/mesajlar"
        className="mb-3 inline-block text-sm text-gray-500 hover:text-gray-700"
      >
        ← Mesajlar
      </Link>

      {listing && (
        <Link
          href={`/elan/${conversation.listing_id}`}
          className="flex items-center gap-3 rounded-t-xl border border-gray-200 bg-white p-3 hover:bg-gray-50"
        >
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <Image src={cover} alt="" fill className="object-cover" unoptimized />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-1 text-sm font-medium text-gray-900">
              {listing.title}
            </p>
            <p className="text-xs text-gray-500">
              {listing.price?.toLocaleString("az")} AZN · {other?.full_name || "İstifadəçi"}
            </p>
          </div>
        </Link>
      )}

      <div className="flex min-h-[40vh] flex-1 flex-col gap-2 border-x border-gray-200 bg-gray-50 p-4">
        {messages.length === 0 ? (
          <p className="m-auto text-sm text-gray-400">
            Söhbətə başlamaq üçün mesaj yazın.
          </p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === user.id;
            return (
              <div
                key={m.id}
                className={`flex ${mine ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                    mine
                      ? "rounded-br-sm bg-green-700 text-white"
                      : "rounded-bl-sm bg-white text-gray-800 shadow-sm"
                  }`}
                >
                  <p className="whitespace-pre-line">{m.content}</p>
                  <p
                    className={`mt-1 text-[10px] ${
                      mine ? "text-green-100" : "text-gray-400"
                    }`}
                  >
                    {formatTime(m.created_at)}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="rounded-b-xl">
        <MessageComposer conversationId={id} />
      </div>
    </main>
  );
}
