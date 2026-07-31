import { create } from 'zustand';

const useOrderStore = create((set) => ({
  activeOrder: null,
  trackingInterval: null,

  setActiveOrder: (order) => set({ activeOrder: order }),

  startTracking: (order) => {
    const statuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];
    let currentIdx = statuses.indexOf(order.status);

    set({ activeOrder: order });

    const interval = setInterval(() => {
      currentIdx++;
      if (currentIdx >= statuses.length) {
        clearInterval(interval);
        return;
      }
      const nextStatus = statuses[currentIdx];
      set((state) => ({
        activeOrder: state.activeOrder
          ? {
              ...state.activeOrder,
              status: nextStatus,
              statusHistory: [
                ...(state.activeOrder.statusHistory || []),
                { status: nextStatus, timestamp: new Date().toISOString() }
              ]
            }
          : null,
      }));
    }, 15000); // advance every 15 seconds in demo

    set({ trackingInterval: interval });
  },

  stopTracking: () => {
    const { trackingInterval } = useOrderStore.getState();
    if (trackingInterval) clearInterval(trackingInterval);
    set({ trackingInterval: null });
  },

  clearOrder: () => set({ activeOrder: null }),
}));

export default useOrderStore;
