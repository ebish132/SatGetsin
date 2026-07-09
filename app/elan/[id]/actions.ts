"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function makeOffer(formData: FormData) {
  const listingId = formData.get("listingId") as string;
  const amount = Number(formData.get("amount"));

  if (!listingId || !amount || amount <= 0) {
    return { error: "Düzgün məbləğ daxil edin." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=/elan/${listingId}`);
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("user_id")
    .eq("id", listingId)
    .single();

  if (listing?.user_id === user.id) {
    return { error: "Öz elanınıza təklif verə bilməzsiniz." };
  }

  const { error } = await supabase.from("offers").insert({
    listing_id: listingId,
    buyer_id: user.id,
    amount,
  });

  if (error) {
    return { error: "Təklif göndərilmədi. Yenidən cəhd edin." };
  }

  revalidatePath(`/elan/${listingId}`);
  return { success: true };
}

export async function respondToOffer(formData: FormData) {
  const offerId = formData.get("offerId") as string;
  const listingId = formData.get("listingId") as string;
  const status = formData.get("status") as string;

  if (!["accepted", "rejected"].includes(status)) {
    return;
  }

  const supabase = await createClient();
  await supabase.from("offers").update({ status }).eq("id", offerId);

  revalidatePath(`/elan/${listingId}`);
}
