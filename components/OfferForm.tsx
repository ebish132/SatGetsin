"use client";

import { useActionState, useState } from "react";
import { makeOffer } from "@/app/elan/[id]/actions";

type State = { error?: string; success?: boolean };

export default function OfferForm({ listingId }: { listingId: string }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => await makeOffer(formData),
    {},
  );
  const [amount, setAmount] = useState("");

  if (state.success) {
    return (
      <p className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
        Təklifiniz göndərildi ✓
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="listingId" value={listingId} />
      {state.error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}
      <div className="flex gap-2">
        <input
          name="amount"
          type="number"
          min={1}
          step="0.01"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Təklifiniz (AZN)"
          className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-green-700 px-4 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
        >
          {pending ? "Göndərilir..." : "Təklif ver"}
        </button>
      </div>
    </form>
  );
}
