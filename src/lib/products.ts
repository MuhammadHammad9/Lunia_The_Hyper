export interface Product {
  id: number;
  name: string;
  tagline: string;
  price: number;
  image: string;
  badge: string | null;
}

export const products: Product[] = [
  {
    id: 1,
    name: "Regenerating Serum",
    tagline: "Ultra-concentrated Mucin",
    price: 89,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
    badge: "Best Seller",
  },
  {
    id: 2,
    name: "Hydrating Cream",
    tagline: "24-hour Moisture Lock",
    price: 65,
    image: "https://images.unsplash.com/photo-1601049541289-9b1b7bbbfe19?q=80&w=800&auto=format&fit=crop",
    badge: null,
  },
  {
    id: 3,
    name: "UV Defense SPF 50",
    tagline: "Mineral Antioxidant",
    price: 45,
    image: "https://images.unsplash.com/photo-1556228720-1987ba3a9e3d?q=80&w=800&auto=format&fit=crop",
    badge: "New",
  },
];

export const allProducts: Product[] = [
  ...products,
  {
    id: 4,
    name: "Night Repair Oil",
    tagline: "Retinol Alternative",
    price: 105,
    image: "https://images.unsplash.com/photo-1608248597279-f99d160bfcb8?q=80&w=800&auto=format&fit=crop",
    badge: "Rare",
  },
  {
    id: 5,
    name: "Purifying Cleanser",
    tagline: "pH Balanced Foam",
    price: 35,
    image: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=800&auto=format&fit=crop",
    badge: null,
  },
  {
    id: 6,
    name: "Eye Lift Cream",
    tagline: "Peptide Complex",
    price: 75,
    image: "https://images.unsplash.com/photo-1629198688000-71f23e745b6e?q=80&w=800&auto=format&fit=crop",
    badge: null,
  },
];

export const bundles: Product[] = [
  {
    id: 101,
    name: "The Complete Ritual",
    tagline: "Cleanser, Serum, Cream",
    price: 175,
    image: "https://images.unsplash.com/photo-1571781535014-53bd96016e15?q=80&w=800&auto=format&fit=crop",
    badge: "Save 15%",
  },
  {
    id: 102,
    name: "Hydration Kit",
    tagline: "Serum + Cream",
    price: 140,
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?q=80&w=800&auto=format&fit=crop",
    badge: "Best Value",
  },
  {
    id: 103,
    name: "Anti-Aging Duo",
    tagline: "Night Oil + Eye Cream",
    price: 160,
    image: "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?q=80&w=800&auto=format&fit=crop",
    badge: null,
  },
];

export const reviews = [
  {
    name: "Sarah Chen",
    role: "Verified Buyer",
    text: "After just two weeks, my skin feels completely transformed.",
    img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop",
  },
  {
    name: "Dr. Torres",
    role: "Dermatologist",
    text: "Rare to see natural ingredients backed by such rigorous science.",
    img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop",
  },
  {
    name: "Emma R.",
    role: "Verified Buyer",
    text: "Lunia has been a game-changer. My skin has never looked better!",
    img: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
  },
  {
    name: "Olivia B.",
    role: "Vogue Editor",
    text: "The absolute gold standard for clean beauty in 2026.",
    img: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop",
  },
  {
    name: "David Kim",
    role: "Verified Buyer",
    text: "Hydration level is unmatched. Like a drink of water for my face.",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
  },
  {
    name: "Sophie L.",
    role: "Influencer",
    text: "Obsessed with the packaging and even more obsessed with the results.",
    img: "https://images.unsplash.com/photo-1554151228-14d9def656ec?q=80&w=150&auto=format&fit=crop",
  },
];
