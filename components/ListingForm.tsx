"use client";

import { useActionState, useState } from "react";
import { saveListing } from "@/app/elan-yerlesdir/actions";
import { createClient } from "@/lib/supabase/client";
import { categories } from "@/lib/categories";
import { cities } from "@/lib/cities";
import PromotionPicker from "@/components/PromotionPicker";
import type { Listing } from "@/lib/listings";

type State = { error?: string };

export default function ListingForm({
  userId,
  listing,
  balance = 0,
}: {
  userId: string;
  listing?: Listing;
  balance?: number;
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prevState, formData) => await saveListing(formData),
    {},
  );

  const [newId] = useState(() => crypto.randomUUID());
  const listingId = listing?.id ?? newId;
  const [images, setImages] = useState<string[]>(listing?.images ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [category, setCategory] = useState(listing?.category ?? "");
  const types = categories.find((c) => c.slug === category)?.types ?? [];

  async function handleImagesChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    setUploading(true);
    setUploadError("");

    const supabase = createClient();
    const uploaded: string[] = [];

    for (const file of files) {
      const path = `${userId}/${listingId}/${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage
        .from("listings")
        .upload(path, file);

      if (error) {
        const hint = error.message.toLowerCase().includes("not found")
          ? " (supabase/listings.sql faylını Supabase SQL Editor-da işlətdiyinizə əmin olun)"
          : "";
        setUploadError("Şəkil yüklənmədi: " + error.message + hint);
        continue;
      }

      const { data } = supabase.storage.from("listings").getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }

    setImages((prev) => [...prev, ...uploaded]);
    setUploading(false);
    e.target.value = "";
  }

  function removeImage(url: string) {
    setImages((prev) => prev.filter((img) => img !== url));
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      {state.error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        {listing && <input type="hidden" name="id" value={listing.id} />}
        {!listing && <input type="hidden" name="newId" value={newId} />}
        {images.map((url) => (
          <input key={url} type="hidden" name="images" value={url} />
        ))}

        <label className="text-xs font-medium text-gray-600">Başlıq</label>
        <input
          name="title"
          required
          defaultValue={listing?.title ?? ""}
          placeholder="məs. iPhone 12, 128GB"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
        />

        <label className="text-xs font-medium text-gray-600">Təsvir</label>
        <textarea
          name="description"
          rows={3}
          defaultValue={listing?.description ?? ""}
          placeholder="Əşya haqqında qısa məlumat"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
        />

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Qiymət (AZN)
            </label>
            <input
              name="price"
              type="number"
              min={0}
              step="0.01"
              required
              defaultValue={listing?.price ?? ""}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Şəhər</label>
            <select
              name="city"
              required
              defaultValue={listing?.city ?? ""}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
            >
              <option value="" disabled>
                Şəhər seçin
              </option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Kateqoriya</label>
            <select
              name="category"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
            >
              <option value="" disabled>
                Kateqoriya seçin
              </option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.icon} {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Növ</label>
            <select
              name="subcategory"
              required
              disabled={!category}
              defaultValue={listing?.subcategory ?? ""}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-green-600 focus:outline-none disabled:bg-gray-100"
            >
              <option value="" disabled>
                {category ? "Növ seçin" : "Əvvəlcə kateqoriya seçin"}
              </option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>

        <label className="text-xs font-medium text-gray-600">Şəkillər</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImagesChange}
          className="text-sm text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
        />
        {uploading && <p className="text-xs text-gray-500">Yüklənir...</p>}
        {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}

        {images.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {images.map((url) => (
              <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-black/60 text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <PromotionPicker
          initialTier={listing?.promotion_tier ?? "none"}
          initialBudget={listing?.daily_budget ?? 0}
          promotedAt={listing?.promoted_at}
          balance={balance}
        />

        <button
          type="submit"
          disabled={pending || uploading}
          className="mt-2 rounded-full bg-green-700 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
        >
          {pending ? "Saxlanılır..." : listing ? "Dəyişiklikləri saxla" : "Elanı yerləşdir"}
        </button>
      </form>
    </div>
  );
}
