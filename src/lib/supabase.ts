import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import type { Database, Json } from './database.types'

export const createSupabaseClient = () => {
  return createClientComponentClient<Database>()
}

export const createSupabaseServerClient = async () => {
  const { cookies } = await import('next/headers')
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}

export const createSupabaseAdminClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )
}

export const supabaseUtils = {
  async getCurrentUser(supabase: ReturnType<typeof createSupabaseClient>) {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  },

  async getUserPrompts(
    supabase: ReturnType<typeof createSupabaseClient>,
    userId: string,
    options: {
      folderId?: string
      search?: string
      isTemplate?: boolean
      isFavorite?: boolean
      limit?: number
      offset?: number
    } = {}
  ) {
    let query = supabase
      .from('prompts')
      .select(`
        *,
        folder:folders(id, name, color),
        persona:personas(id, name, role)
      `)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })

    if (options.folderId) {
      query = query.eq('folder_id', options.folderId)
    }

    if (options.isTemplate !== undefined) {
      query = query.eq('is_template', options.isTemplate)
    }

    if (options.isFavorite !== undefined) {
      query = query.eq('is_favorite', options.isFavorite)
    }

    if (options.search) {
      query = query.or(`title.ilike.%${options.search}%,description.ilike.%${options.search}%,content.ilike.%${options.search}%`)
    }

    if (options.limit) {
      const start = options.offset || 0
      query = query.range(start, start + options.limit - 1)
    }

    const { data, error } = await query

    if (error) throw error
    return data
  },

  async getUserFolders(supabase: ReturnType<typeof createSupabaseClient>, userId: string) {
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .eq('user_id', userId)
      .order('position', { ascending: true })

    if (error) throw error
    return data
  },

  async getUserPersonas(supabase: ReturnType<typeof createSupabaseClient>, userId: string) {
    const { data, error } = await supabase
      .from('personas')
      .select('*')
      .eq('user_id', userId)
      .order('use_count', { ascending: false })

    if (error) throw error
    return data
  },

  async trackPromptUsage(
    supabase: ReturnType<typeof createSupabaseClient>,
    userId: string,
    promptId: string,
    action: string,
    metadata: Json = {}
  ) {
    const { error } = await supabase
      .from('prompt_usage')
      .insert({
        user_id: userId,
        prompt_id: promptId,
        action,
        metadata
      })

    if (error) console.error('Failed to track usage:', error)

    if (action === 'copied') {
      const { error: updateError } = await supabase.rpc('increment_prompt_usage', {
        prompt_id: promptId
      })

      if (updateError) console.error('Failed to update prompt usage:', updateError)
    }
  }
}
