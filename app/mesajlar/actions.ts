"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function startConversation(formData: FormData) {
  const listingId = formData.get("listingId") as string;
  const sellerId = formData.get("sellerId") as string;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/elan/${listingId}`);
  }

  if (user.id === sellerId) {
    redirect(`/elan/${listingId}`);
  }

  // Mövcud söhbət varsa onu tap, yoxsa yarat
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("listing_id", listingId)
    .eq("buyer_id", user.id)
    .maybeSingle();

  let conversationId = existing?.id;

  if (!conversationId) {
    const { data: created, error } = await supabase
      .from("conversations")
      .insert({
        listing_id: listingId,
        buyer_id: user.id,
        seller_id: sellerId,
      })
      .select("id")
      .single();

    if (error || !created) {
      redirect(`/elan/${listingId}?error=1`);
    }
    conversationId = created.id;
  }

  redirect(`/mesajlar/${conversationId}`);
}

export async function sendMessage(formData: FormData) {
  const conversationId = formData.get("conversationId") as string;
  const content = (formData.get("content") as string)?.trim();

  if (!content) {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    content,
  });

  revalidatePath(`/mesajlar/${conversationId}`);
}
