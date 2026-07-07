"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Bu əməliyyat üçün giriş etməlisiniz." };
  }

  const full_name = formData.get("fullName") as string;
  const phone = formData.get("phone") as string;
  const city = formData.get("city") as string;
  const avatar_url = formData.get("avatarUrl") as string;

  if (!/^[0-9]{10}$/.test(phone)) {
    return { error: "Telefon nömrəsi 10 rəqəmdən ibarət olmalıdır (məs. 0501234567)." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name, phone, city, avatar_url, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/");
}
