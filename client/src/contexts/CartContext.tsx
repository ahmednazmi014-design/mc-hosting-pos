import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type StoreProduct = {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  price: number;
  packSize: string;
  available: boolean;
  featured: boolean;
  popularity: number;
};

export type CartLine = { product: StoreProduct; quantity: number };

type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  subtotal: number;
  addItem: (product: StoreProduct, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const CART_KEY = "frixo-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>(() => {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    addItem: (product, quantity = 1) => {
      if (!product.available) return;
      setItems(current => {
        const found = current.find(item => item.product.id === product.id);
        if (found) return current.map(item => item.product.id === product.id ? { ...item, quantity: Math.min(item.quantity + quantity, 50) } : item);
        return [...current, { product, quantity: Math.min(quantity, 50) }];
      });
    },
    updateQuantity: (productId, quantity) => setItems(current => quantity <= 0 ? current.filter(item => item.product.id !== productId) : current.map(item => item.product.id === productId ? { ...item, quantity: Math.min(quantity, 50) } : item)),
    removeItem: productId => setItems(current => current.filter(item => item.product.id !== productId)),
    clear: () => setItems([]),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}

export const formatPKR = (amount: number) => `Rs. ${amount.toLocaleString("en-PK")}`;
