
import { createContext, useContext, useReducer, ReactNode } from 'react';
import { Perfume, PerfumeVariant, CartItem } from '@/types/perfume';

interface CartState {
  items: CartItem[];
  total: number;
}

interface CartContextType extends CartState {
  addToCart: (perfume: Perfume, variant: PerfumeVariant) => void;
  removeFromCart: (perfumeId: string, variantId: string) => void;
  updateQuantity: (perfumeId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

type CartAction = 
  | { type: 'ADD_TO_CART'; payload: { perfume: Perfume; variant: PerfumeVariant } }
  | { type: 'REMOVE_FROM_CART'; payload: { perfumeId: string; variantId: string } }
  | { type: 'UPDATE_QUANTITY'; payload: { perfumeId: string; variantId: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const calculateTotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.variant.price * item.quantity, 0);
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const existingItem = state.items.find(item => 
        item.perfume.id === action.payload.perfume.id && 
        item.variant.id === action.payload.variant.id
      );
      
      if (existingItem) {
        const updatedItems = state.items.map(item =>
          item.perfume.id === action.payload.perfume.id && item.variant.id === action.payload.variant.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
        return {
          items: updatedItems,
          total: calculateTotal(updatedItems),
        };
      } else {
        const newItems = [...state.items, { 
          perfume: action.payload.perfume, 
          variant: action.payload.variant, 
          quantity: 1 
        }];
        return {
          items: newItems,
          total: calculateTotal(newItems),
        };
      }
    }
    
    case 'REMOVE_FROM_CART': {
      const filteredItems = state.items.filter(item => 
        !(item.perfume.id === action.payload.perfumeId && item.variant.id === action.payload.variantId)
      );
      return {
        items: filteredItems,
        total: calculateTotal(filteredItems),
      };
    }
    
    case 'UPDATE_QUANTITY': {
      if (action.payload.quantity <= 0) {
        const filteredItems = state.items.filter(item => 
          !(item.perfume.id === action.payload.perfumeId && item.variant.id === action.payload.variantId)
        );
        return {
          items: filteredItems,
          total: calculateTotal(filteredItems),
        };
      }
      
      const updatedItems = state.items.map(item =>
        item.perfume.id === action.payload.perfumeId && item.variant.id === action.payload.variantId
          ? { ...item, quantity: action.payload.quantity }
          : item
      );
      return {
        items: updatedItems,
        total: calculateTotal(updatedItems),
      };
    }
    
    case 'CLEAR_CART':
      return { items: [], total: 0 };
      
    default:
      return state;
  }
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 });

  const addToCart = (perfume: Perfume, variant: PerfumeVariant) => {
    dispatch({ type: 'ADD_TO_CART', payload: { perfume, variant } });
  };

  const removeFromCart = (perfumeId: string, variantId: string) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: { perfumeId, variantId } });
  };

  const updateQuantity = (perfumeId: string, variantId: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { perfumeId, variantId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  const itemCount = state.items.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
