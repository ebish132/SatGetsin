"use client";

import { useActionState, useState } from "react";
import { submitTopupRequest } from "@/app/balans/actions";
import { createClient } from "@/lib/supabase/client";

type State = { error?: string; success?: boolean };

const PRESETS = [5, 10, 20, 50];
const CARD_NUMBER = "5411 2498 1309 5291";

export default function TopUpForm({ userId }: { userId: string }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => await submitTopupRequest(formData),
    {},
  );
  const [amount, setAmount] = useState(10);
  const [showPayment, setShowPayment] = useState(false);
  const [receiptPath, setReceiptPath] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleReceiptChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreviewUrl(URL.createObjectURL(file));
    setUploading(true);
    setUploadError("");

    const supabase = createClient();
    const path = `${userId}/${crypto.randomUUID()}-${file.name}`;
    const { error } = await supabase.storage.from("receipts").upload(path, file);

    if (error) {
      const hint = error.message.toLowerCase().includes("not found")
        ? " (supabase/schema.sql faylını Supabase SQL Editor-da işlətdiyinizə əmin olun)"
        : "";
      setUploadError("Şəkil yüklənmədi: " + error.message + hint);
      setUploading(false);
      return;
    }

    setReceiptPath(path);
    setUploading(false);
  }

  if (state.success) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-900">Balans artır</h2>
        <p className="mt-3 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          ✅ Çekiniz göndərildi. Təsdiqləndikdən sonra balansınıza əlavə
          olunacaq.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-gray-900">Balans artır</h2>

      {!showPayment ? (
        <div className="mt-4 flex flex-col gap-4">
          <div>
            <label className="text-xs font-medium text-gray-600">
              Məbləğ (AZN) — minimum 1.00
            </label>
            <input
              type="number"
              min={1}
              step="0.5"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
            />
            <div className="mt-2 flex gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                    amount === p
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {p} AZN
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={!amount || amount < 1}
            onClick={() => setShowPayment(true)}
            className="rounded-full bg-green-700 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
          >
            Ödə
          </button>
        </div>
      ) : (
        <form action={formAction} className="mt-4 flex flex-col gap-4">
          <input type="hidden" name="amount" value={amount} />
          <input type="hidden" name="receiptPath" value={receiptPath} />

          {state.error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
              {state.error}
            </p>
          )}

          <div className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-900">
            <p>
              <strong>{amount.toFixed(2)} AZN</strong> məbləğini bu karta
              köçürün:
            </p>
            <p className="mt-1 text-base font-semibold tracking-wider">
              {CARD_NUMBER}
            </p>
            <p className="mt-2 text-xs text-amber-800">
              Köçürmədən sonra çekin şəklini (skrinşot) aşağıda yükləyin.
            </p>
          </div>

          <div>
            <label className="text-xs font-medium text-gray-600">
              Çekin şəkli
            </label>
            <label
              htmlFor="receipt-upload"
              className={`mt-1 flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed bg-gray-50 px-4 py-6 text-center transition hover:bg-gray-100 ${
                receiptPath ? "border-green-400" : "border-gray-300"
              }`}
            >
              {previewUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewUrl}
                  alt="Seçilmiş çek"
                  className="mb-1 h-24 rounded-md object-contain"
                />
              ) : (
                <span className="text-2xl">📎</span>
              )}
              <span className="text-sm font-medium text-gray-700">
                {receiptPath ? "Başqa şəkil seç" : "Çekin şəklini buradan yükləyin"}
              </span>
              <span className="text-xs text-gray-400">Kliklə şəkil seç</span>
              <input
                id="receipt-upload"
                type="file"
                accept="image/*"
                onChange={handleReceiptChange}
                className="hidden"
              />
            </label>
            {uploading && (
              <p className="mt-1 text-xs text-gray-500">Yüklənir...</p>
            )}
            {uploadError && (
              <p className="mt-1 text-xs text-red-600">{uploadError}</p>
            )}
            {receiptPath && !uploading && (
              <p className="mt-1 text-xs text-green-700">Şəkil yükləndi ✓</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowPayment(false)}
              className="flex-1 rounded-full border border-gray-300 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Geri
            </button>
            <button
              type="submit"
              disabled={pending || uploading || !receiptPath}
              className="flex-1 rounded-full bg-green-700 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
            >
              {pending ? "Göndərilir..." : "Çeki göndər"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
