import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useSupabase } from '@/components/providers'
import { createSupabaseClient, supabaseUtils } from '@/lib/supabase'
import type { Prompt, Inserts } from '@/lib/database.types'

export function usePrompts(options: {
  folderId?: string
  search?: string
  isTemplate?: boolean
  isFavorite?: boolean
} = {}) {
  const { user, supabase } = useSupabase()

  return useQuery({
    queryKey: ['prompts', user?.id, options],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')
      return supabaseUtils.getUserPrompts(supabase, user.id, options)
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
  })
}

export function useFolders() {
  const { user, supabase } = useSupabase()

  return useQuery({
    queryKey: ['folders', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')
      return supabaseUtils.getUserFolders(supabase, user.id)
    },
    enabled: !!user,
  })
}

export function usePersonas() {
  const { user, supabase } = useSupabase()

  return useQuery({
    queryKey: ['personas', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')
      return supabaseUtils.getUserPersonas(supabase, user.id)
    },
    enabled: !!user,
  })
}

export function useCreatePrompt() {
  const { user, supabase } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: Inserts<'prompts'>) => {
      if (!user) throw new Error('User not authenticated')

      const { data: prompt, error } = await supabase
        .from('prompts')
        .insert({
          ...data,
          user_id: user.id,
        })
        .select(`
          *,
          folder:folders(id, name, color),
          persona:personas(id, name, role)
        `)
        .single()

      if (error) throw error

      await supabaseUtils.trackPromptUsage(supabase, user.id, prompt.id, 'created')

      return prompt
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] })
    },
  })
}

export function useUpdatePrompt() {
  const { user, supabase } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Prompt> }) => {
      if (!user) throw new Error('User not authenticated')

      const { data: prompt, error } = await supabase
        .from('prompts')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select(`
          *,
          folder:folders(id, name, color),
          persona:personas(id, name, role)
        `)
        .single()

      if (error) throw error

      await supabaseUtils.trackPromptUsage(supabase, user.id, id, 'edited')

      return prompt
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] })
    },
  })
}

export function useDeletePrompt() {
  const { user, supabase } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] })
    },
  })
}

export function useCopyPrompt() {
  const { user, supabase } = useSupabase()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated')

      const { error } = await supabase.rpc('increment_prompt_usage', {
        prompt_id: id
      })

      if (error) throw error

      await supabaseUtils.trackPromptUsage(supabase, user.id, id, 'copied')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts'] })
    },
  })
}
