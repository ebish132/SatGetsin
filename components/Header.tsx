import Link from "next/link";
import Logo from "@/components/Logo";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let balance = 0;
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance, is_admin")
      .eq("id", user.id)
      .single();
    balance = Number(profile?.balance ?? 0);
    isAdmin = !!profile?.is_admin;
  }

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3">
        <Logo />

        <form
          action="/"
          className="order-3 w-full flex-1 sm:order-none sm:w-auto"
        >
          <input
            name="q"
            type="search"
            placeholder="Nə axtarırsınız?"
            className="w-full rounded-full border border-gray-300 px-4 py-2 text-sm focus:border-green-600 focus:outline-none"
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:block"
          >
            Ana səhifə
          </Link>
          {user ? (
            <>
              <Link
                href="/balans"
                className="rounded-full bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
              >
                💰 {balance.toFixed(2)} AZN
              </Link>
              <Link
                href="/mesajlar"
                className="hidden rounded-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:block"
              >
                Mesajlar
              </Link>
              <Link
                href="/elanlarim"
                className="hidden rounded-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:block"
              >
                Elanlarım
              </Link>
              <Link
                href="/profil"
                className="hidden rounded-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:block"
              >
                Profilim
              </Link>
              {isAdmin && (
                <Link
                  href="/admin/balans"
                  className="hidden rounded-full bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 sm:block"
                >
                  Admin
                </Link>
              )}
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                >
                  Çıxış
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
            >
              Giriş / Qeydiyyat
            </Link>
          )}
          <Link
            href="/elan-yerlesdir/yeni"
            className="hidden rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 sm:block"
          >
            Elan yerləşdir
          </Link>
        </div>
      </div>
    </header>
  );
}
