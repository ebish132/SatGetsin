export type Listing = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  category: string;
  subcategory: string | null;
  city: string;
  images: string[];
  status: "active" | "sold";
  promotion_tier: "none" | "sade" | "vip";
  daily_budget: number;
  promoted_at: string | null;
  created_at: string;
};
