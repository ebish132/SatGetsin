"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "E-poçt və ya şifrə yanlışdır.",
  "Email not confirmed": "E-poçtunuz hələ təsdiqlənməyib. Zəhmət olmasa poçt qutunuzu yoxlayın.",
  "User already registered": "Bu e-poçt ilə artıq qeydiyyat mövcuddur.",
};

function translateError(message: string) {
  return ERROR_MESSAGES[message] ?? message;
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(translateError(error.message))}`);
  }

  revalidatePath("/", "layout");
  redirect("/profil");
}

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const fullName = formData.get("fullName") as string;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(translateError(error.message))}`);
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/profil");
  }

  redirect(
    `/login?message=${encodeURIComponent(
      "Qeydiyyat tamamlandı. Zəhmət olmasa e-poçtunuzu təsdiqləyin.",
    )}`,
  );
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
