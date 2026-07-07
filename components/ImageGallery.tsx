"use client";

import Image from "next/image";
import { useState } from "react";

export default function ImageGallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const pics =
    images.length > 0
      ? images
      : ["https://placehold.co/600x450?text=Şəkil+yoxdur"];
  const [active, setActive] = useState(0);

  return (
    <div>
      <div className="relative aspect-4/3 w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
        <Image
          src={pics[active]}
          alt={title}
          fill
          className="object-contain"
          unoptimized
        />
      </div>

      {pics.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
          {pics.map((url, i) => (
            <button
              key={url}
              onClick={() => setActive(i)}
              className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-lg border-2 ${
                i === active ? "border-green-600" : "border-transparent"
              }`}
            >
              <Image src={url} alt="" fill className="object-cover" unoptimized />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
