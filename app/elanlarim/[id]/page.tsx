import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ListingForm from "@/components/ListingForm";
import type { Listing } from "@/lib/listings";

export default async function ElanRedaktePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: listing } = await supabase
    .from("listings")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!listing) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-900">Elanı redaktə et</h1>
      <ListingForm
        userId={user.id}
        listing={listing as Listing}
        balance={Number(profile?.balance ?? 0)}
      />
    </main>
  );
}
