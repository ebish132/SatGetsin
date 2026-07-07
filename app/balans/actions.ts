"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const MIN_TOPUP = 1;
const METHODS = ["visa", "mastercard", "m10"];
const TOPUP_ENABLED = false;

export async function topUpBalance(formData: FormData) {
  if (!TOPUP_ENABLED) {
    return { error: "Balans yükləmə hazırda müvəqqəti bağlıdır." };
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bu əməliyyat üçün giriş etməlisiniz." };
  }

  const amount = Number(formData.get("amount"));
  const method = formData.get("method") as string;

  if (!METHODS.includes(method)) {
    return { error: "Ödəniş növü seçin." };
  }
  if (!amount || amount < MIN_TOPUP) {
    return { error: `Minimum balans yükləmə ${MIN_TOPUP.toFixed(2)} AZN-dir.` };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();

  const newBalance = Number(profile?.balance ?? 0) + amount;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ balance: newBalance })
    .eq("id", user.id);

  if (updateError) return { error: updateError.message };

  const { error: txError } = await supabase.from("wallet_transactions").insert({
    user_id: user.id,
    type: "topup",
    amount,
    method,
  });

  if (txError) return { error: txError.message };

  revalidatePath("/balans");
  return { success: true };
}
