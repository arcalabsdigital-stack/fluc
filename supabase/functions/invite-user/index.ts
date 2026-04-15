import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Missing Authorization header')
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } },
    )

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('role, organization_id')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      throw new Error('Apenas administradores podem gerenciar convites')
    }

    const body = await req.json()
    const { action, email, fullName, role, password, userId } = body

    const supabaseAdmin = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    )

    if (action === 'resend') {
      if (!userId) throw new Error('ID do usuário não fornecido')

      const { data: targetUser, error: getUserError } =
        await supabaseAdmin.auth.admin.getUserById(userId)
      if (getUserError || !targetUser?.user)
        throw new Error('Usuário não encontrado')

      const tempPassword = targetUser.user.user_metadata?.temp_password
      if (!tempPassword)
        throw new Error(
          'Não foi possível encontrar a senha inicial para reenvio. O usuário pode já ter alterado a senha.',
        )

      const res = await fetch(`${supabaseUrl}/functions/v1/welcome-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
        },
        body: JSON.stringify({
          email: targetUser.user.email,
          name:
            targetUser.user.user_metadata?.full_name || targetUser.user.email,
          password: tempPassword,
        }),
      })

      if (!res.ok) throw new Error('Erro ao disparar o e-mail de boas-vindas')

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    // Default action: invite
    if (!password) {
      throw new Error('A senha inicial é obrigatória')
    }

    const { data: newUser, error: createError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          organization_id: profile.organization_id,
          role: role,
          must_change_password: true,
          temp_password: password,
        },
      })

    if (createError) throw createError

    return new Response(JSON.stringify({ success: true, user: newUser.user }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    let errorMessage = error.message || 'Erro desconhecido'
    if (
      errorMessage.includes('User already registered') ||
      errorMessage.includes('already exists')
    ) {
      errorMessage = 'Este e-mail já está cadastrado.'
    }
    // Return 200 so the frontend can read the JSON body
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  }
})
