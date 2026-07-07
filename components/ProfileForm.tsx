"use client";

import { useActionState, useState } from "react";
import { updateProfile } from "@/app/profil/actions";
import { createClient } from "@/lib/supabase/client";
import { cities } from "@/lib/cities";

type Profile = {
  full_name: string | null;
  phone: string | null;
  city: string | null;
  avatar_url: string | null;
};

type State = { error?: string };

export default function ProfileForm({
  userId,
  email,
  profile,
}: {
  userId: string;
  email: string;
  profile: Profile | null;
}) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prevState, formData) => await updateProfile(formData),
    {},
  );
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? "");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError("");

    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `${userId}/avatar.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (error) {
      setUploadError("Şəkil yüklənmədi: " + error.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
    setUploading(false);
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-sm rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gray-100 text-xl font-semibold text-gray-400">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt="Profil şəkli"
              className="h-full w-full object-cover"
            />
          ) : (
            (profile?.full_name?.[0] ?? email[0]).toUpperCase()
          )}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {profile?.full_name || "Ad qeyd olunmayıb"}
          </p>
          <p className="text-xs text-gray-500">{email}</p>
        </div>
      </div>

      {state.error && (
        <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
          {state.error}
        </p>
      )}

      <form action={formAction} className="flex flex-col gap-3">
        <label className="text-xs font-medium text-gray-600">Ad Soyad</label>
        <input
          name="fullName"
          defaultValue={profile?.full_name ?? ""}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
        />

        <label className="text-xs font-medium text-gray-600">Telefon</label>
        <input
          name="phone"
          type="tel"
          required
          pattern="[0-9]{10}"
          maxLength={10}
          inputMode="numeric"
          title="10 rəqəmdən ibarət nömrə daxil edin (məs. 0501234567)"
          defaultValue={profile?.phone ?? ""}
          placeholder="0501234567"
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-600 focus:outline-none"
        />
        <p className="-mt-2 text-xs text-gray-400">10 rəqəm, boşluqsuz (məs. 0501234567)</p>

        <label className="text-xs font-medium text-gray-600">Şəhər</label>
        <select
          name="city"
          defaultValue={profile?.city ?? ""}
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

        <label className="text-xs font-medium text-gray-600">
          Profil şəkli
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          className="text-sm text-gray-600 file:mr-3 file:rounded-full file:border-0 file:bg-gray-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
        />
        {uploading && <p className="text-xs text-gray-500">Yüklənir...</p>}
        {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
        <input type="hidden" name="avatarUrl" value={avatarUrl} />

        <button
          type="submit"
          disabled={pending || uploading}
          className="mt-2 rounded-full bg-green-700 py-2 text-sm font-medium text-white hover:bg-green-800 disabled:opacity-60"
        >
          {pending ? "Yadda saxlanılır..." : "Yadda saxla"}
        </button>
      </form>
    </div>
  );
}
