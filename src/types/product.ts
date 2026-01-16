export interface DisplayProduct {
  id: string | number;
  name: string;
  tagline: string;
  price: number;
  compareAtPrice?: number | null;
  image: string;
  badge: string | null;
  description?: string | null;
  ingredients?: string | null;
  benefits?: string[] | null;
  images?: string[];
  stockQuantity?: number | null;
  isOutOfStock?: boolean;
}
