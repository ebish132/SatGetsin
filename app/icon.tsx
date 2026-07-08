import { ImageResponse } from "next/og";

export const size = { width: 256, height: 256 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #22c55e, #15803d)",
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width={160}
          height={160}
          fill="none"
          stroke="white"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0l-7.17-7.17a2 2 0 0 1-.58-1.41V5a2 2 0 0 1 2-2h6.99a2 2 0 0 1 1.41.58l7.17 7.17a2 2 0 0 1 0 2.83Z" />
          <circle cx="7.5" cy="7.5" r="1.4" fill="white" stroke="none" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
