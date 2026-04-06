import { create } from "zustand";

export const useCartStore = create((set) => ({
  cart: [],

  addToCart: (product) =>
    set((state) => ({
      // Gunakan timestamp sebagai unique ID agar item yang sama bisa punya topping berbeda
      cart: [
        ...state.cart,
        { ...product, cartId: Date.now(), qty: 1, selectedToppings: [] },
      ],
    })),

  toggleTopping: (cartId, topping) =>
    set((state) => ({
      cart: state.cart.map((item) => {
        if (item.cartId === cartId) {
          const hasTopping = item.selectedToppings.find(
            (t) => t.id === topping.id,
          );
          const newToppings = hasTopping
            ? item.selectedToppings.filter((t) => t.id !== topping.id)
            : [...item.selectedToppings, topping];
          return { ...item, selectedToppings: newToppings };
        }
        return item;
      }),
    })),

  removeFromCart: (cartId) =>
    set((state) => ({
      cart: state.cart.filter((item) => item.cartId !== cartId),
    })),

  updateQty: (cartId, delta) =>
    set((state) => ({
      cart: state.cart.map((item) => {
        if (item.cartId === cartId) {
          const newQty = item.qty + delta;
          return { ...item, qty: newQty > 0 ? newQty : 1 };
        }
        return item;
      }),
    })),

  clearCart: () => set({ cart: [] }),
}));
