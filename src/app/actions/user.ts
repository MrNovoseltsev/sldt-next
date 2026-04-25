'use server'

import { createClient } from '@/lib/supabase/server'

export async function updateProfileAction(name: string): Promise<{ error: string | null }> {
  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ data: { full_name: name } })
  if (error) return { error: error.message }
  return { error: null }
}

export async function changePasswordAction({
  email,
  currentPassword,
  newPassword,
}: {
  email: string
  currentPassword: string
  newPassword: string
}): Promise<{ error: string | null }> {
  const supabase = await createClient()

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  })
  if (signInError) return { error: 'Неверный текущий пароль' }

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }

  return { error: null }
}
