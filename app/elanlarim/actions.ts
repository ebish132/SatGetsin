"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function deleteListing(formData: FormData) {
  const id = formData.get("id") as string;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase.from("listings").delete().eq("id", id).eq("user_id", user.id);
  revalidatePath("/elanlarim");
}

export async function toggleListingStatus(formData: FormData) {
  const id = formData.get("id") as string;
  const status = formData.get("status") as string;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  await supabase
    .from("listings")
    .update({ status })
    .eq("id", id)
    .eq("user_id", user.id);

  revalidatePath("/elanlarim");
}
