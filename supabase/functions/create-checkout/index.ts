import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) throw new Error('Missing Authorization header')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''

    const supabaseClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()
    if (userError || !user) throw new Error('Unauthorized')

    const { plan, organization_id } = await req.json()
    if (!plan || !organization_id)
      throw new Error('Missing plan or organization_id')

    const { data: userWs } = await supabaseClient
      .from('user_workspaces')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organization_id)
      .single()

    if (!userWs || userWs.role !== 'admin')
      throw new Error('Apenas administradores podem realizar essa ação')

    const { data: org } = await supabaseAdmin
      .from('organizations')
      .select('*')
      .eq('id', organization_id)
      .single()
    const { data: sub } = await supabaseAdmin
      .from('subscriptions')
      .select('*')
      .eq('organization_id', organization_id)
      .single()
    const { data: planData } = await supabaseAdmin
      .from('plans')
      .select('*')
      .eq('name', plan)
      .single()

    if (!org || !sub || !planData)
      throw new Error('Organization, Subscription or Plan not found')

    const ASAAS_API_KEY = Deno.env.get('ASAAS_API_KEY') || 'dummy_for_testing'

    if (ASAAS_API_KEY === 'dummy_for_testing') {
      const dummyUrl = 'https://api.asaas.com/i/dummy_invoice_' + Date.now()

      await supabaseAdmin.from('billing_history').insert({
        organization_id: organization_id,
        subscription_id: sub.id,
        amount: planData.price,
        status: 'pending',
        invoice_url: dummyUrl,
      })

      return new Response(JSON.stringify({ invoiceUrl: dummyUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let asaasCustomerId = sub.asaas_customer_id

    if (!asaasCustomerId) {
      const customerRes = await fetch('https://api.asaas.com/v3/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: ASAAS_API_KEY,
        },
        body: JSON.stringify({
          name: org.corporate_name || org.name,
          email: user.email,
          cpfCnpj: org.cnpj || undefined,
        }),
      })

      if (!customerRes.ok) {
        const err = await customerRes.text()
        throw new Error(`Failed to create Asaas customer: ${err}`)
      }

      const customerData = await customerRes.json()
      asaasCustomerId = customerData.id

      await supabaseAdmin
        .from('subscriptions')
        .update({ asaas_customer_id: asaasCustomerId })
        .eq('id', sub.id)
    }

    const paymentRes = await fetch('https://api.asaas.com/v3/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        access_token: ASAAS_API_KEY,
      },
      body: JSON.stringify({
        customer: asaasCustomerId,
        billingType: 'UNDEFINED',
        value: planData.price,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        description: `Assinatura ${planData.name} - ${org.name}`,
      }),
    })

    if (!paymentRes.ok) {
      const err = await paymentRes.text()
      throw new Error(`Failed to create Asaas payment: ${err}`)
    }

    const paymentData = await paymentRes.json()

    await supabaseAdmin.from('billing_history').insert({
      organization_id: organization_id,
      subscription_id: sub.id,
      amount: planData.price,
      status: 'pending',
      asaas_payment_id: paymentData.id,
      invoice_url: paymentData.invoiceUrl,
    })

    return new Response(
      JSON.stringify({ invoiceUrl: paymentData.invoiceUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      },
    )
  } catch (err: any) {
    console.error('Error in create-checkout:', err)
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
