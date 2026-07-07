"use client";

import { useActionState, useState } from "react";
import { signIn, signUp } from "@/app/login/actions";

export default function LoginForm({
  error,
  message,
}: {
  error?: string;
  message?: string;
}) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [, signInAction, signInPending] = useActionState(async (_prev: void, formData: FormData) => {
    await signIn(formData);
  }, undefined);
  const [, signUpAction, signUpPending] = useActionState(async (_prev: void, formData: FormData) => {
    await signUp(formData);
  }, undefined);

  return (
    <div className="mx-auto mt-10 w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-6 flex rounded-full bg-gray-100 p-1 text-sm font-medium">
        <button
          type="button"
          onClick={() => setTab("login")}
          className={`flex-1 rounded-full py-2 transition ${
            tab === "login" ? "bg-white text-green-700 shadow" : "text-gray-500"
          }`}
        >
          Giriş
        </button>
        <button
          type="button"
          onClick={() => setTab("signup")}
          className={`flex-1 rounded-full py-2 transition ${
            tab === "signup" ? "bg-white text-green-700 shadow" : "text-gray-500"
          }`}
        >
          Qeydiyyat
        </button>
      </div>

      {error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {error}
        </p>
      )}
      {message && (
        <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700">
          {message}
        </p>
      )}

      {tab === "login" ? (
        <form action={signInAction} className="flex flex-col gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder="E-poçt"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Şifrə"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={signInPending}
            className="mt-2 rounded-full bg-green-700 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
          >
            {signInPending ? "Daxil olunur..." : "Daxil ol"}
          </button>
        </form>
      ) : (
        <form action={signUpAction} className="flex flex-col gap-3">
          <input
            name="fullName"
            type="text"
            required
            placeholder="Ad Soyad"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
          />
          <input
            name="email"
            type="email"
            required
            placeholder="E-poçt"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
          />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="Şifrə (ən az 6 simvol)"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
          />
          <button
            type="submit"
            disabled={signUpPending}
            className="mt-2 rounded-full bg-green-700 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
          >
            {signUpPending ? "Göndərilir..." : "Qeydiyyatdan keç"}
          </button>
        </form>
      )}
    </div>
  );
}
