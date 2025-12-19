
export interface PerfumeVariant {
  id: string;
  number: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  preorder?: boolean;
  releaseDate?: string;
  rating?: number;
  reviewCount?: number;
  inspiredBy?: string;
}

export interface Perfume {
  id: string;
  name: string;
  brand: string;
  category: string;
  size: string;
  image: string;
  description?: string;
  scentNotes?: string[];
  inspiredBy?: string;
  aiDescription?: string;
  seasons?: string[];
  occasions?: string[];
  variants: PerfumeVariant[];
}

export interface CartItem {
  perfume: Perfume;
  variant: PerfumeVariant;
  quantity: number;
}
