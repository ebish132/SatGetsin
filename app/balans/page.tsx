import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import TopUpForm from "@/components/TopUpForm";

type Tx = {
  id: string;
  type: "topup" | "ad_spend";
  amount: number;
  method: string | null;
  created_at: string;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("az-AZ", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function BalansPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/balans");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("balance")
    .eq("id", user.id)
    .single();

  const { data: txData } = await supabase
    .from("wallet_transactions")
    .select("id, type, amount, method, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const transactions = (txData ?? []) as Tx[];
  const balance = Number(profile?.balance ?? 0);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-900">Balansım</h1>

      <div className="rounded-xl bg-gradient-to-br from-green-600 to-green-800 p-5 text-white shadow-sm">
        <p className="text-xs text-green-100">Cari balans</p>
        <p className="mt-1 text-3xl font-bold">{balance.toFixed(2)} AZN</p>
      </div>

      <div className="mt-4">
        <TopUpForm />
      </div>

      <div className="mt-6">
        <h2 className="mb-2 text-sm font-semibold text-gray-900">
          Əməliyyatlar
        </h2>
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500">Hələ əməliyyat yoxdur.</p>
        ) : (
          <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {tx.type === "topup" ? "Balans yükləmə" : "Reklam xərci"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatDate(tx.created_at)}
                    {tx.method ? ` · ${tx.method.toUpperCase()}` : ""}
                  </p>
                </div>
                <span
                  className={`font-semibold ${
                    tx.type === "topup" ? "text-green-700" : "text-red-600"
                  }`}
                >
                  {tx.type === "topup" ? "+" : "−"}
                  {tx.amount.toFixed(2)} AZN
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
