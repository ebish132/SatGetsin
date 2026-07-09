import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ReceiptImage from "@/components/ReceiptImage";
import { approveTopupRequest, rejectTopupRequest } from "./actions";

type Request = {
  id: string;
  user_id: string;
  amount: number;
  receipt_path: string;
  status: string;
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

export default async function AdminBalansPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/admin/balans");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/");
  }

  const { data: requestsData } = await supabase
    .from("topup_requests")
    .select("id, user_id, amount, receipt_path, status, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: true });

  const requests = (requestsData ?? []) as Request[];

  const userIds = [...new Set(requests.map((r) => r.user_id))];
  const { data: profilesData } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, full_name, phone")
        .in("id", userIds)
    : { data: [] as { id: string; full_name: string | null; phone: string | null }[] };

  const profileById = new Map((profilesData ?? []).map((p) => [p.id, p]));

  const requestsWithUrls = await Promise.all(
    requests.map(async (r) => {
      const { data } = await supabase.storage
        .from("receipts")
        .createSignedUrl(r.receipt_path, 300);
      return { ...r, signedUrl: data?.signedUrl ?? null };
    }),
  );

  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold text-gray-900">
        Balans yükləmə sorğuları
      </h1>

      {requestsWithUrls.length === 0 ? (
        <p className="text-sm text-gray-500">Gözləyən sorğu yoxdur.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {requestsWithUrls.map((r) => {
            const buyer = profileById.get(r.user_id);
            return (
              <div
                key={r.id}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row sm:items-start"
              >
                {r.signedUrl && (
                  <div className="shrink-0 sm:w-40">
                    <ReceiptImage src={r.signedUrl} />
                    <p className="mt-1 text-center text-[11px] text-gray-400">
                      Böyütmək üçün klikləyin
                    </p>
                  </div>
                )}

                <div className="flex-1">
                  <p className="text-lg font-bold text-green-700">
                    {r.amount.toFixed(2)} AZN
                  </p>
                  <p className="mt-1 text-sm font-medium text-gray-900">
                    {buyer?.full_name || "İstifadəçi"}
                  </p>
                  {buyer?.phone && (
                    <p className="text-xs text-gray-500">{buyer.phone}</p>
                  )}
                  <p className="mt-1 text-xs text-gray-400">
                    {formatDate(r.created_at)}
                  </p>

                  <div className="mt-3 flex gap-2">
                    <form action={approveTopupRequest}>
                      <input type="hidden" name="requestId" value={r.id} />
                      <input type="hidden" name="userId" value={r.user_id} />
                      <input type="hidden" name="amount" value={r.amount} />
                      <button
                        type="submit"
                        className="rounded-full bg-green-700 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-800"
                      >
                        Təsdiqlə
                      </button>
                    </form>
                    <form action={rejectTopupRequest}>
                      <input type="hidden" name="requestId" value={r.id} />
                      <button
                        type="submit"
                        className="rounded-full border border-gray-300 px-4 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        Rədd et
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
