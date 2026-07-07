"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  href: string;
  label: string;
  icon: string;
  auth?: boolean;
};

const items: Item[] = [
  { href: "/", label: "Ana səhifə", icon: "🏠" },
  { href: "/mesajlar", label: "Mesajlar", icon: "💬", auth: true },
  { href: "/elan-yerlesdir/yeni", label: "Elan ver", icon: "➕" },
  { href: "/elanlarim", label: "Elanlarım", icon: "📋", auth: true },
  { href: "/profil", label: "Profil", icon: "👤", auth: true },
];

export default function BottomNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 border-t border-gray-200 bg-white/95 backdrop-blur sm:hidden">
      <div className="mx-auto flex max-w-6xl items-stretch justify-around">
        {items.map((item) => {
          const href =
            item.auth && !isLoggedIn ? "/login?next=" + item.href : item.href;
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          if (item.href === "/elan-yerlesdir/yeni") {
            return (
              <Link
                key={item.href}
                href={href}
                className="flex flex-1 flex-col items-center justify-center py-1.5"
              >
                <span className="-mt-4 flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-700 text-lg text-white shadow-md">
                  {item.icon}
                </span>
                <span className="mt-0.5 text-[10px] font-medium text-gray-600">
                  {item.label}
                </span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={href}
              className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition ${
                active ? "text-green-700" : "text-gray-500"
              }`}
            >
              <span className="text-lg leading-none">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
