export interface Perfume {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  category: string;
  size: string;
  inStock: boolean;
  rating?: number;
  reviewCount?: number;
}

export interface CartItem {
  perfume: Perfume;
  quantity: number;
}