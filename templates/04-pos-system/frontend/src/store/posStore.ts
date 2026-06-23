import { create } from "zustand";
import type { Product } from "@/api/products";

export type CartItem = Product & { quantity: number };

interface PosState {
  cart: CartItem[];
  discountPct: number;
  payment: string;
  received: string;
  checkingOut: boolean;

  addToCart: (product: Product) => void;
  setQty: (id: string, q: number) => void;
  clearCart: () => void;
  setDiscountPct: (pct: number) => void;
  setPayment: (method: string) => void;
  setReceived: (amount: string) => void;
  setCheckingOut: (v: boolean) => void;
}

export const usePosStore = create<PosState>()((set) => ({
  cart: [],
  discountPct: 0,
  payment: "efectivo",
  received: "",
  checkingOut: false,

  addToCart: (product) =>
    set((s) => {
      const i = s.cart.findIndex((x) => x.id === product.id);
      if (i >= 0) {
        const copy = [...s.cart];
        copy[i] = { ...copy[i], quantity: copy[i].quantity + 1 };
        return { cart: copy };
      }
      return { cart: [{ ...product, quantity: 1 }, ...s.cart] };
    }),

  setQty: (id, q) =>
    set((s) => ({
      cart: q <= 0
        ? s.cart.filter((x) => x.id !== id)
        : s.cart.map((x) => (x.id === id ? { ...x, quantity: q } : x)),
    })),

  clearCart: () => set({ cart: [], discountPct: 0, received: "", payment: "efectivo" }),

  setDiscountPct: (discountPct) => set({ discountPct }),
  setPayment: (payment) => set({ payment }),
  setReceived: (received) => set({ received }),
  setCheckingOut: (checkingOut) => set({ checkingOut }),
}));
