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

type TopupRequest = {
  id: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  created_at: string;
};

const REQUEST_STATUS_LABEL: Record<string, string> = {
  pending: "Gözləyir",
  approved: "Təsdiqləndi",
  rejected: "Rədd edildi",
};

const REQUEST_STATUS_CLASS: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-green-50 text-green-700",
  rejected: "bg-red-50 text-red-600",
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

  const { data: requestsData } = await supabase
    .from("topup_requests")
    .select("id, amount, status, created_at")
    .eq("user_id", user.id)
    .neq("status", "approved")
    .order("created_at", { ascending: false });

  const transactions = (txData ?? []) as Tx[];
  const pendingRequests = (requestsData ?? []) as TopupRequest[];
  const balance = Number(profile?.balance ?? 0);

  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-900">Balansım</h1>

      <div className="rounded-xl bg-gradient-to-br from-green-600 to-green-800 p-5 text-white shadow-sm">
        <p className="text-xs text-green-100">Cari balans</p>
        <p className="mt-1 text-3xl font-bold">{balance.toFixed(2)} AZN</p>
      </div>

      <div className="mt-4">
        <TopUpForm userId={user.id} />
      </div>

      {pendingRequests.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">
            Balans yükləmə sorğuları
          </h2>
          <div className="divide-y divide-gray-100 overflow-hidden rounded-xl border border-gray-200 bg-white">
            {pendingRequests.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium text-gray-800">
                    {r.amount.toFixed(2)} AZN
                  </p>
                  <p className="text-xs text-gray-400">{formatDate(r.created_at)}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${REQUEST_STATUS_CLASS[r.status]}`}
                >
                  {REQUEST_STATUS_LABEL[r.status]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

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
