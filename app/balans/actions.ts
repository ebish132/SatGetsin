"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MIN_TOPUP = 1;

export async function submitTopupRequest(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bu əməliyyat üçün giriş etməlisiniz." };
  }

  const amount = Number(formData.get("amount"));
  const receiptPath = formData.get("receiptPath") as string;

  if (!amount || amount < MIN_TOPUP) {
    return { error: `Minimum balans yükləmə ${MIN_TOPUP.toFixed(2)} AZN-dir.` };
  }
  if (!receiptPath) {
    return { error: "Çekin şəklini yükləyin." };
  }

  const { error } = await supabase.from("topup_requests").insert({
    user_id: user.id,
    amount,
    receipt_path: receiptPath,
  });

  if (error) return { error: error.message };

  revalidatePath("/balans");
  return { success: true };
}
