export type Category = {
  slug: string;
  name: string;
  icon: string;
  types: string[];
};

export const categories: Category[] = [
  {
    slug: "elektronika",
    name: "Elektronika",
    icon: "📱",
    types: ["Telefon", "Noutbuk/Kompüter", "Televizor", "Foto/Video", "Aksesuarlar", "Digər"],
  },
  {
    slug: "geyim",
    name: "Geyim",
    icon: "👕",
    types: ["Kişi geyimi", "Qadın geyimi", "Uşaq geyimi", "Ayaqqabı", "Aksesuar", "Digər"],
  },
  {
    slug: "ev-esyalari",
    name: "Ev əşyaları",
    icon: "🛋️",
    types: ["Mebel", "Məişət texnikası", "Qab-qacaq", "Dekor", "Digər"],
  },
  {
    slug: "neqliyyat",
    name: "Nəqliyyat",
    icon: "🚗",
    types: ["Avtomobil", "Motosiklet", "Velosiped", "Ehtiyat hissələri", "Digər"],
  },
  {
    slug: "diger",
    name: "Digər",
    icon: "📦",
    types: ["Kitablar", "İdman", "Uşaq əşyaları", "Heyvanlar", "Digər"],
  },
];
