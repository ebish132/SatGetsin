"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const ERROR_MESSAGES: Record<string, string> = {
  "Invalid login credentials": "E-poçt və ya şifrə yanlışdır.",
  "Email not confirmed": "E-poçtunuz hələ təsdiqlənməyib. Zəhmət olmasa göndərilən kodu təsdiqləyin.",
  "User already registered": "Bu e-poçt ilə artıq qeydiyyat mövcuddur.",
  "Token has expired or is invalid": "Kod yanlış və ya vaxtı keçib.",
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

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(translateError(error.message))}`);
  }

  redirect(`/dogrula?email=${encodeURIComponent(email)}`);
}

export async function verifySignupCode(formData: FormData) {
  const email = formData.get("email") as string;
  const code = (formData.get("code") as string)?.trim();

  if (!code || code.length < 6) {
    return { error: "6 rəqəmli kodu tam daxil edin." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.verifyOtp({
    email,
    token: code,
    type: "signup",
  });

  if (error) {
    return { error: translateError(error.message) };
  }

  revalidatePath("/", "layout");
  redirect("/profil");
}

export async function resendSignupCode(formData: FormData) {
  const email = formData.get("email") as string;
  const supabase = await createClient();

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
  });

  if (error) {
    return { error: translateError(error.message) };
  }

  return { success: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/");
}
