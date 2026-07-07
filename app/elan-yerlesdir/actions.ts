"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const COOLDOWN_HOURS = 24;

export async function saveListing(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bu əməliyyat üçün giriş etməlisiniz." };
  }

  const id = formData.get("id") as string;
  const newId = formData.get("newId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const price = Number(formData.get("price"));
  const category = formData.get("category") as string;
  const subcategory = formData.get("subcategory") as string;
  const city = formData.get("city") as string;
  const images = formData.getAll("images") as string[];
  const requestedTierRaw = formData.get("promotionTier") as string;
  const requestedTier = ["none", "sade", "vip"].includes(requestedTierRaw)
    ? requestedTierRaw
    : "none";
  const requestedBudget =
    requestedTier === "none"
      ? 0
      : Math.round((Number(formData.get("dailyBudget")) || 0) * 100) / 100;

  if (!title || !category || !subcategory || !city || !price || images.length === 0) {
    return {
      error: "Zəhmət olmasa bütün məcburi sahələri doldurun və ən azı 1 şəkil əlavə edin.",
    };
  }

  // Mövcud elanın reklam vəziyyətini yoxla (redaktə halında)
  let existing: { promotion_tier: string; daily_budget: number; promoted_at: string | null } | null = null;
  if (id) {
    const { data } = await supabase
      .from("listings")
      .select("promotion_tier, daily_budget, promoted_at")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();
    existing = data;
  }

  const isLocked =
    !!existing &&
    existing.promotion_tier !== "none" &&
    !!existing.promoted_at &&
    Date.now() - new Date(existing.promoted_at).getTime() <
      COOLDOWN_HOURS * 60 * 60 * 1000;

  let promotion_tier = existing?.promotion_tier ?? "none";
  let daily_budget = existing?.daily_budget ?? 0;
  let promoted_at = existing?.promoted_at ?? null;
  let spendTx: { amount: number } | null = null;

  if (isLocked) {
    // Reklam aktivdir və ləğv/dəyişiklik edilə bilməz — mövcud dəyərlər saxlanılır.
    promotion_tier = existing!.promotion_tier;
    daily_budget = existing!.daily_budget;
    promoted_at = existing!.promoted_at;
  } else if (requestedTier !== "none") {
    // Yeni reklam aktivləşdirilir (yeni elan və ya kilidsiz redaktə)
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();

    const balance = Number(profile?.balance ?? 0);

    if (balance < requestedBudget) {
      return {
        error: `Balansınız kifayət deyil (${balance.toFixed(2)} AZN). Balans artırın.`,
      };
    }

    promotion_tier = requestedTier;
    daily_budget = requestedBudget;
    promoted_at = new Date().toISOString();
    spendTx = { amount: requestedBudget };
  } else {
    // Reklam istənmir və kilid yoxdur
    promotion_tier = "none";
    daily_budget = 0;
  }

  const payload = {
    title,
    description,
    price,
    category,
    subcategory,
    city,
    images,
    promotion_tier,
    daily_budget,
    promoted_at,
    updated_at: new Date().toISOString(),
  };

  const listingId = id || newId;

  if (id) {
    const { error } = await supabase
      .from("listings")
      .update(payload)
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) return { error: error.message };
  } else {
    const { error } = await supabase
      .from("listings")
      .insert({ ...payload, id: newId, user_id: user.id });

    if (error) return { error: error.message };
  }

  if (spendTx) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single();

    await supabase
      .from("profiles")
      .update({ balance: Number(profile?.balance ?? 0) - spendTx.amount })
      .eq("id", user.id);

    await supabase.from("wallet_transactions").insert({
      user_id: user.id,
      type: "ad_spend",
      amount: spendTx.amount,
      listing_id: listingId,
    });
  }

  revalidatePath("/elanlarim");
  revalidatePath("/balans");
  redirect("/elanlarim");
}
