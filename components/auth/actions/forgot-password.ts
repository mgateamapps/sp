'use server'

import { createClient } from '@/lib/supabase/server'
import { forgotPasswordSchema } from '@/lib/zod'

export async function handleForgotPasswordAction(formData: FormData) {
  const email = formData.get('email')
  const parsed = forgotPasswordSchema.safeParse({ email })

  if (!parsed.success) {
    return {
      success: false,
      error: 'Please enter a valid email address',
    }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password`,
  })

  if (error) {
    return {
      success: false,
      error: error.message,
    }
  }

  return {
    success: true,
  }
}
