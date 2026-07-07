import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ListingForm from "@/components/ListingForm";

export default async function YeniElanPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-900">Yeni elan</h1>
      <ListingForm userId={user.id} balance={Number(profile?.balance ?? 0)} />
    </main>
  );
}
