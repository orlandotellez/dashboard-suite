import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SideBarState {
  collapsed: boolean;
  toggle: () => void;
}

export const useSideBarStore = create<SideBarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set((s) => ({ collapsed: !s.collapsed })),
    }),
    { name: "caja-sidebar" },
  ),
);
