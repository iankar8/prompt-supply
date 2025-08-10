import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Prompt, Folder, Persona } from '@/lib/database.types'

interface PromptStore {
  prompts: Prompt[]
  folders: Folder[]
  personas: Persona[]
  selectedFolderId: string | null
  searchQuery: string
  viewMode: 'grid' | 'list'
  showFavorites: boolean
  isLoading: boolean
  
  setPrompts: (prompts: Prompt[]) => void
  addPrompt: (prompt: Prompt) => void
  updatePrompt: (id: string, updates: Partial<Prompt>) => void
  removePrompt: (id: string) => void
  
  setFolders: (folders: Folder[]) => void
  addFolder: (folder: Folder) => void
  updateFolder: (id: string, updates: Partial<Folder>) => void
  removeFolder: (id: string) => void
  
  setPersonas: (personas: Persona[]) => void
  addPersona: (persona: Persona) => void
  updatePersona: (id: string, updates: Partial<Persona>) => void
  removePersona: (id: string) => void
  
  setSelectedFolderId: (folderId: string | null) => void
  setSearchQuery: (query: string) => void
  setViewMode: (mode: 'grid' | 'list') => void
  setShowFavorites: (show: boolean) => void
  setIsLoading: (loading: boolean) => void
  
  filteredPrompts: () => Prompt[]
  getPromptById: (id: string) => Prompt | undefined
  getFolderById: (id: string) => Folder | undefined
  getPersonaById: (id: string) => Persona | undefined
}

export const usePromptStore = create<PromptStore>()(
  devtools(
    (set, get) => ({
      prompts: [],
      folders: [],
      personas: [],
      selectedFolderId: null,
      searchQuery: '',
      viewMode: 'grid',
      showFavorites: false,
      isLoading: false,

      setPrompts: (prompts) => set({ prompts }),
      addPrompt: (prompt) => set((state) => ({ 
        prompts: [prompt, ...state.prompts] 
      })),
      updatePrompt: (id, updates) => set((state) => ({
        prompts: state.prompts.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      removePrompt: (id) => set((state) => ({
        prompts: state.prompts.filter(p => p.id !== id)
      })),

      setFolders: (folders) => set({ folders }),
      addFolder: (folder) => set((state) => ({ 
        folders: [...state.folders, folder] 
      })),
      updateFolder: (id, updates) => set((state) => ({
        folders: state.folders.map(f => f.id === id ? { ...f, ...updates } : f)
      })),
      removeFolder: (id) => set((state) => ({
        folders: state.folders.filter(f => f.id !== id)
      })),

      setPersonas: (personas) => set({ personas }),
      addPersona: (persona) => set((state) => ({ 
        personas: [...state.personas, persona] 
      })),
      updatePersona: (id, updates) => set((state) => ({
        personas: state.personas.map(p => p.id === id ? { ...p, ...updates } : p)
      })),
      removePersona: (id) => set((state) => ({
        personas: state.personas.filter(p => p.id !== id)
      })),

      setSelectedFolderId: (folderId) => set({ selectedFolderId: folderId }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setShowFavorites: (show) => set({ showFavorites: show }),
      setIsLoading: (loading) => set({ isLoading: loading }),

      filteredPrompts: () => {
        const { prompts, selectedFolderId, searchQuery, showFavorites } = get()
        
        return prompts.filter(prompt => {
          if (selectedFolderId && prompt.folder_id !== selectedFolderId) {
            return false
          }
          
          if (showFavorites && !prompt.is_favorite) {
            return false
          }
          
          if (searchQuery) {
            const query = searchQuery.toLowerCase()
            return (
              prompt.title.toLowerCase().includes(query) ||
              prompt.content.toLowerCase().includes(query) ||
              prompt.description?.toLowerCase().includes(query) ||
              prompt.tags.some(tag => tag.toLowerCase().includes(query))
            )
          }
          
          return true
        })
      },

      getPromptById: (id) => get().prompts.find(p => p.id === id),
      getFolderById: (id) => get().folders.find(f => f.id === id),
      getPersonaById: (id) => get().personas.find(p => p.id === id),
    }),
    {
      name: 'prompt-store',
    }
  )
)
