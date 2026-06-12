// ============================================================
// UI STORE (Zustand)
//
// Global UI state that doesn't belong to any single component:
// - Sidebar collapsed state (persisted)
// - Which modal is open
// - Active command palette state
//
// LEARNING: Don't put server data here. Server data = TanStack Query.
// UI state that's local to one component = useState.
// UI state shared across unrelated components = this store.
// ============================================================

import { create } from "zustand";
import { useShallow } from "zustand/shallow";
import { persist, createJSONStorage } from "zustand/middleware";

type ModalType = "create-task" | "create-project" | "invite-member" | null;

interface UIState {
  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;

  // Modals
  activeModal: ModalType;
  modalPayload: Record<string, unknown>;
  openModal: (
    type: NonNullable<ModalType>,
    payload?: Record<string, unknown>,
  ) => void;
  closeModal: () => void;

  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;

  // Notifications panel
  notificationsPanelOpen: boolean;
  setNotificationsPanelOpen: (open: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Sidebar
      sidebarCollapsed: false,
      toggleSidebar: () =>
        set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),

      // Modals
      activeModal: null,
      modalPayload: {},
      openModal: (type, payload = {}) =>
        set({ activeModal: type, modalPayload: payload }),
      closeModal: () => set({ activeModal: null, modalPayload: {} }),

      // Command palette
      commandPaletteOpen: false,
      setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

      // Notifications
      notificationsPanelOpen: false,
      setNotificationsPanelOpen: (open) =>
        set({ notificationsPanelOpen: open }),
    }),
    {
      name: "ui-storage",
      storage: createJSONStorage(() => localStorage),
      // Only persist sidebar state across sessions
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
    },
  ),
);

// Selector hooks
export const useSidebarCollapsed = () => useUIStore((s) => s.sidebarCollapsed);
export const useActiveModal = () =>
  useUIStore((s) => ({ modal: s.activeModal, payload: s.modalPayload }));

export const useCommandPalette = () =>
  useUIStore(
    useShallow((s) => ({
      open: s.commandPaletteOpen,
      setOpen: s.setCommandPaletteOpen,
    })),
  );
