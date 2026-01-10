export interface DisplayProduct {
  id: string | number;
  name: string;
  tagline: string;
  price: number;
  image: string;
  badge: string | null;
  description?: string | null;
  ingredients?: string | null;
  benefits?: string[] | null;
  images?: string[];
}
