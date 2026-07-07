import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone, city, avatar_url, balance")
    .eq("id", user.id)
    .single();

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
      <div className="mx-auto mb-4 w-full max-w-sm">
        <Link
          href="/balans"
          className="flex items-center justify-between rounded-xl bg-gradient-to-br from-green-600 to-green-800 px-5 py-4 text-white shadow-sm"
        >
          <span className="text-sm">Balansım</span>
          <span className="text-lg font-bold">
            {Number(profile?.balance ?? 0).toFixed(2)} AZN →
          </span>
        </Link>
      </div>
      <ProfileForm userId={user.id} email={user.email ?? ""} profile={profile} />
    </main>
  );
}
