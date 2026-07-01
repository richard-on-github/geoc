import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SidebarState {
  isCollapsed: boolean
  openSections: string[]   // ids des sections dépliées
}

interface SidebarActions {
  toggle: () => void
  collapse: () => void
  expand: () => void
  toggleSection: (sectionId: string) => void
  openSection: (sectionId: string) => void
}

type SidebarStore = SidebarState & SidebarActions

export const useSidebarStore = create<SidebarStore>()(
  persist(
    (set, get) => ({
      isCollapsed: false,
      openSections: ['security'],   // sections ouvertes par défaut

      toggle: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
      collapse: () => set({ isCollapsed: true }),
      expand: () => set({ isCollapsed: false }),

      toggleSection: (sectionId) => {
        const { openSections } = get()
        set({
          openSections: openSections.includes(sectionId)
            ? openSections.filter((id) => id !== sectionId)
            : [...openSections, sectionId],
        })
      },

      openSection: (sectionId) => {
        const { openSections } = get()
        if (!openSections.includes(sectionId)) {
          set({ openSections: [...openSections, sectionId] })
        }
      },
    }),
    {
      name: 'geoc_sidebar',
      storage: createJSONStorage(() => localStorage),
    },
  ),
)
