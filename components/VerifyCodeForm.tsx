"use client";

import { useActionState, useState } from "react";
import { verifySignupCode, resendSignupCode } from "@/app/login/actions";

type State = { error?: string };

export default function VerifyCodeForm({ email }: { email: string }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => await verifySignupCode(formData),
    {},
  );
  const [code, setCode] = useState("");
  const [resent, setResent] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );

  async function handleResend() {
    setResent("sending");
    const formData = new FormData();
    formData.set("email", email);
    const result = await resendSignupCode(formData);
    setResent(result?.error ? "error" : "sent");
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6 text-center">
      <p className="text-3xl">📩</p>
      <h1 className="mt-2 text-lg font-semibold text-gray-900">
        E-poçtunuzu təsdiqləyin
      </h1>
      <p className="mt-1 text-sm text-gray-500">
        <strong>{email}</strong> ünvanına 6 rəqəmli kod göndərdik.
      </p>

      {state.error && (
        <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <form action={formAction} className="mt-5 flex flex-col gap-3">
        <input type="hidden" name="email" value={email} />
        <input
          name="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          required
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          className="rounded-lg border border-gray-300 px-3 py-3 text-center text-2xl font-semibold tracking-[0.5em] focus:border-green-600 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending || code.length < 6}
          className="rounded-full bg-green-700 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
        >
          {pending ? "Yoxlanılır..." : "Təsdiqlə"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleResend}
        disabled={resent === "sending"}
        className="mt-4 text-sm font-medium text-green-700 hover:underline disabled:opacity-60"
      >
        {resent === "sending"
          ? "Göndərilir..."
          : resent === "sent"
            ? "Kod yenidən göndərildi ✓"
            : "Kodu yenidən göndər"}
      </button>
    </div>
  );
}
