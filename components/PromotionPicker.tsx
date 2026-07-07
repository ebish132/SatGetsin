"use client";

import { useState } from "react";
import Link from "next/link";

const MIN = 0.5;
const MAX = 2;
const STEP = 0.1;
const VIP_THRESHOLD = 1.5;

function hoursLeft(promotedAt: string) {
  const elapsedMs = Date.now() - new Date(promotedAt).getTime();
  const leftMs = 24 * 60 * 60 * 1000 - elapsedMs;
  return Math.max(0, Math.ceil(leftMs / (60 * 60 * 1000)));
}

export default function PromotionPicker({
  initialTier = "none",
  initialBudget = 0,
  promotedAt,
  balance = 0,
}: {
  initialTier?: "none" | "sade" | "vip";
  initialBudget?: number;
  promotedAt?: string | null;
  balance?: number;
}) {
  const locked =
    initialTier !== "none" &&
    !!promotedAt &&
    hoursLeft(promotedAt) > 0;

  const [enabled, setEnabled] = useState(initialTier !== "none");
  const [budget, setBudget] = useState(
    initialBudget > 0 ? initialBudget : MIN,
  );

  const tier: "none" | "sade" | "vip" = !enabled
    ? "none"
    : budget >= VIP_THRESHOLD
      ? "vip"
      : "sade";

  const percent = ((budget - MIN) / (MAX - MIN)) * 100;

  if (locked) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">
            Elanı önə çıxar
          </p>
          {initialTier === "vip" ? (
            <span className="vip-badge inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
              ⭐ VIP aktivdir
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              🔼 Önə çıxarma aktivdir
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-gray-500">
          Bu elan üçün reklam ləğv edilə bilməz. Yenidən dəyişmək üçün{" "}
          <strong>{hoursLeft(promotedAt!)} saat</strong> gözləyin.
        </p>
        <input type="hidden" name="promotionTier" value={initialTier} />
        <input type="hidden" name="dailyBudget" value={initialBudget} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Elanı önə çıxar
          </p>
          <p className="text-xs text-gray-500">
            Günlük büdcə seç, elanın daha çox görünsün
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          onClick={() => setEnabled((v) => !v)}
          className={`relative h-6 w-11 shrink-0 overflow-hidden rounded-full transition-colors duration-300 ${
            enabled ? "bg-green-600" : "bg-gray-300"
          }`}
        >
          <span
            className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-300 ${
              enabled ? "translate-x-[20px]" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      <input type="hidden" name="promotionTier" value={tier} />
      <input
        type="hidden"
        name="dailyBudget"
        value={enabled ? budget.toFixed(2) : "0"}
      />

      {enabled && (
        <div className="promo-panel mt-4">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{MIN.toFixed(2)} AZN</span>
            <span>{MAX.toFixed(2)} AZN</span>
          </div>

          <div className="relative mt-1 py-2">
            <div className="h-2 w-full rounded-full bg-gray-200">
              <div
                className={`h-2 rounded-full transition-all duration-150 ${
                  tier === "vip"
                    ? "bg-gradient-to-r from-amber-400 to-amber-600"
                    : "bg-green-600"
                }`}
                style={{ width: `${percent}%` }}
              />
            </div>
            <input
              type="range"
              min={MIN}
              max={MAX}
              step={STEP}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
              className="promo-slider absolute inset-x-0 top-0 h-6 w-full cursor-pointer appearance-none bg-transparent"
            />
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-800">
              {budget.toFixed(2)} AZN{" "}
              <span className="font-normal text-gray-500">/ gün</span>
            </span>

            {tier === "vip" ? (
              <span className="vip-badge inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-400 to-amber-600 px-3 py-1 text-xs font-bold text-white shadow-sm">
                ⭐ VIP
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                🔼 Sadə önə çıxarma
              </span>
            )}
          </div>

          <p className="mt-2 text-[11px] text-gray-400">
            {VIP_THRESHOLD.toFixed(2)} AZN və üzəri seçdikdə elanınız VIP
            statusu alır. Reklam aktiv olandan sonra ləğv edilə bilməz.
          </p>

          <div className="mt-2 flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
            <span className="text-gray-500">
              Balansınız: <strong>{balance.toFixed(2)} AZN</strong>
            </span>
            {balance < budget && (
              <Link href="/balans" className="font-medium text-green-700 hover:underline">
                Balans artır →
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
