
import { Perfume } from '@/types/perfume';
import perfume1 from '@/assets/perfume-1.jpg';
import perfume2 from '@/assets/perfume-2.jpg';
import perfume3 from '@/assets/perfume-3.jpg';
import perfume4 from '@/assets/perfume-4.jpg';

export const perfumes: Perfume[] = [
  {
    id: '1',
    name: 'Elégance Or',
    brand: 'Maison Luxe',
    price: 44.99,
    originalPrice: 59.99,
    description: 'Ein luxuriöses Parfüm mit Noten von Bergamotte, weißen Blumen und sanftem Moschus. Perfekt für besondere Anlässe.',
    image: perfume1,
    category: 'Damen',
    size: '50ml',
    inStock: true,
    rating: 4.8,
    reviewCount: 234,
  },
  {
    id: '2',
    name: 'Rose Mystique',
    brand: 'Parfum Royal',
    price: 44.99,
    description: 'Romantisches Rosenparfüm mit einem Hauch von Vanille und Amber. Zeitlos elegant und verführerisch.',
    image: perfume2,
    category: 'Damen',
    size: '75ml',
    inStock: true,
    rating: 4.6,
    reviewCount: 189,
  },
  {
    id: '3',
    name: 'Noir Intense',
    brand: 'Black Diamond',
    price: 44.99,
    description: 'Kraftvolles Parfüm mit dunklen Holznoten, schwarzem Pfeffer und einem Hauch von Leder. Für den modernen Mann.',
    image: perfume3,
    category: 'Herren',
    size: '100ml',
    inStock: true,
    rating: 4.9,
    reviewCount: 312,
  },
  {
    id: '4',
    name: 'Crystal Pure',
    brand: 'Pure Essence',
    price: 44.99,
    originalPrice: 54.99,
    description: 'Frisches und reines Parfüm mit Zitrusnoten und aquatischen Akkorden. Ideal für den täglichen Gebrauch.',
    image: perfume4,
    category: 'Unisex',
    size: '60ml',
    inStock: true,
    rating: 4.4,
    reviewCount: 156,
  },
];
