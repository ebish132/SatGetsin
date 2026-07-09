"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  return profile?.is_admin ? supabase : null;
}

export async function approveTopupRequest(formData: FormData) {
  const supabase = await requireAdmin();
  if (!supabase) return;

  const requestId = formData.get("requestId") as string;
  const userId = formData.get("userId") as string;
  const amount = Number(formData.get("amount"));

  const { data: request } = await supabase
    .from("topup_requests")
    .select("status")
    .eq("id", requestId)
    .single();

  if (!request || request.status !== "pending") {
    return;
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", userId)
    .single();

  await supabase
    .from("profiles")
    .update({ balance: Number(profile?.balance ?? 0) + amount })
    .eq("id", userId);

  await supabase.from("wallet_transactions").insert({
    user_id: userId,
    type: "topup",
    amount,
    method: "bank_transfer",
  });

  await supabase
    .from("topup_requests")
    .update({ status: "approved", reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  revalidatePath("/admin/balans");
  revalidatePath("/balans");
}

export async function rejectTopupRequest(formData: FormData) {
  const supabase = await requireAdmin();
  if (!supabase) return;

  const requestId = formData.get("requestId") as string;

  await supabase
    .from("topup_requests")
    .update({ status: "rejected", reviewed_at: new Date().toISOString() })
    .eq("id", requestId);

  revalidatePath("/admin/balans");
  revalidatePath("/balans");
}
