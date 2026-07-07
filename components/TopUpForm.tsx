"use client";

import { useActionState, useState } from "react";
import { topUpBalance } from "@/app/balans/actions";

type State = { error?: string; success?: boolean };

const METHODS = [
  { id: "visa", label: "Visa", cls: "bg-blue-700" },
  { id: "mastercard", label: "Mastercard", cls: "bg-gradient-to-r from-red-500 to-amber-500" },
  { id: "m10", label: "M10", cls: "bg-purple-700" },
] as const;

const PRESETS = [1, 3, 5, 10];

export default function TopUpForm() {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => await topUpBalance(formData),
    {},
  );
  const [amount, setAmount] = useState(1);
  const [method, setMethod] = useState<(typeof METHODS)[number]["id"]>("visa");

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="text-sm font-semibold text-gray-900">Balans artır</h2>

      {state.error && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="mt-3 topup-success rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          ✅ Balans uğurla artırıldı.
        </p>
      )}

      <form action={formAction} className="mt-4 flex flex-col gap-4">
        <div>
          <label className="text-xs font-medium text-gray-600">
            Məbləğ (AZN) — minimum 1.00
          </label>
          <input
            name="amount"
            type="number"
            min={1}
            step="0.5"
            required
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

        <div>
          <label className="text-xs font-medium text-gray-600">Ödəniş növü</label>
          <input type="hidden" name="method" value={method} />
          <div className="mt-1 grid grid-cols-3 gap-2">
            {METHODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`method-card rounded-lg border-2 p-3 text-center transition ${
                  method === m.id
                    ? "border-green-600"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <span
                  className={`mx-auto flex h-8 w-12 items-center justify-center rounded-md text-[10px] font-extrabold italic text-white ${m.cls}`}
                >
                  {m.label === "Visa" ? "VISA" : m.label === "Mastercard" ? "MC" : "M10"}
                </span>
                <span className="mt-1 block text-xs text-gray-600">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-green-700 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
        >
          {pending ? "Göndərilir..." : `${amount.toFixed(2)} AZN yüklə`}
        </button>
      </form>
    </div>
  );
}
