import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  id: string;
  name: string;
  category: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  add: (p: Omit<CartItem, "quantity">) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  remove: (id: string) => void;
  clear: () => void;
  totalCount: number;
  getQuantity: (id: string) => number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "vgm:cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const add: CartContextValue["add"] = (p) =>
      setItems((prev) => {
        const existing = prev.find((it) => it.id === p.id);
        if (existing) {
          return prev.map((it) => (it.id === p.id ? { ...it, quantity: it.quantity + 1 } : it));
        }
        return [...prev, { ...p, quantity: 1 }];
      });

    const increment: CartContextValue["increment"] = (id) =>
      setItems((prev) => prev.map((it) => (it.id === id ? { ...it, quantity: it.quantity + 1 } : it)));

    const decrement: CartContextValue["decrement"] = (id) =>
      setItems((prev) =>
        prev
          .map((it) => (it.id === id ? { ...it, quantity: it.quantity - 1 } : it))
          .filter((it) => it.quantity > 0),
      );

    const remove: CartContextValue["remove"] = (id) =>
      setItems((prev) => prev.filter((it) => it.id !== id));

    const clear = () => setItems([]);
    const totalCount = items.reduce((sum, it) => sum + it.quantity, 0);
    const getQuantity = (id: string) => items.find((it) => it.id === id)?.quantity ?? 0;

    return { items, add, increment, decrement, remove, clear, totalCount, getQuantity };
  }, [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
