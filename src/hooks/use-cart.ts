import { Product } from "@/payload-types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

// add items to the cart
// remove items from the cart
// clear all items
// (persist the items in the cart in a store "zustand")

export type CartItem = {
  product: Product;
};

type CartState = {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => {
      return {
        items: [],
        addItem: (product) =>
          set((state) => {
            return {
              items: [...state.items, { product }],
            };
          }),
        removeItem: (productId) =>
          set((state) => {
            return {
              items: state.items.filter(
                (item) => item.product.id !== productId
              ),
            };
          }),
        clearCart: () =>
          set((state) => {
            return {
              items: [],
            };
          }),
      };
    },
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
