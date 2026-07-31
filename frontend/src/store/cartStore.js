import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      restaurantId: null,
      restaurantName: '',

      addItem: (item, restaurantId, restaurantName) => {
        const { items, restaurantId: currentRestaurant } = get();

        // Prevent mixing restaurants
        if (currentRestaurant && currentRestaurant !== restaurantId) {
          return { conflict: true };
        }

        const existing = items.find((i) => i._id === item._id);
        if (existing) {
          set({
            items: items.map((i) =>
              i._id === item._id ? { ...i, quantity: i.quantity + 1 } : i
            ),
          });
        } else {
          set({
            items: [...items, { ...item, quantity: 1 }],
            restaurantId,
            restaurantName,
          });
        }
        return { conflict: false };
      },

      removeItem: (itemId) => {
        const items = get().items.filter((i) => i._id !== itemId);
        set({ items, ...(items.length === 0 && { restaurantId: null, restaurantName: '' }) });
      },

      updateQuantity: (itemId, quantity) => {
        if (quantity < 1) {
          get().removeItem(itemId);
          return;
        }
        set({
          items: get().items.map((i) =>
            i._id === itemId ? { ...i, quantity } : i
          ),
        });
      },

      clearCart: () => set({ items: [], restaurantId: null, restaurantName: '' }),

      getSubtotal: () =>
        get().items.reduce((sum, item) => sum + (item.discountedPrice || item.price) * item.quantity, 0),

      getTotalItems: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'foodrush-cart',
    }
  )
);

export default useCartStore;
