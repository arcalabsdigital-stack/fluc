import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, name } = await req.json()

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY is not set')
      throw new Error('Server configuration error')
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bem-vindo ao Fluc seu novo Planejador Financeiro</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #334155; background-color: #F8F9FB; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0; }
          .header { background-color: #0F172A; padding: 32px 40px; text-align: center; }
          .logo { font-size: 28px; font-weight: 800; color: #ffffff; letter-spacing: -0.025em; }
          .logo span { background-color: #38bdf8; color: #0F172A; padding: 4px 10px; border-radius: 8px; margin-right: 8px; }
          .content { padding: 40px; }
          .greeting { font-size: 24px; font-weight: 700; color: #0f172a; margin-bottom: 16px; }
          .intro { margin-bottom: 32px; color: #475569; font-size: 16px; }
          .section { margin-bottom: 24px; background-color: #f8fafc; padding: 24px; border-radius: 12px; border: 1px solid #f1f5f9; }
          .section-title { font-weight: 700; color: #0f172a; font-size: 18px; margin-bottom: 12px; display: flex; align-items: center; }
          .section p { margin-top: 0; margin-bottom: 12px; color: #475569; }
          .footer { background-color: #f8fafc; padding: 24px 40px; text-align: center; font-size: 13px; color: #64748b; border-top: 1px solid #e2e8f0; }
          ul { margin: 0; padding-left: 20px; color: #475569; }
          li { margin-bottom: 8px; }
          strong { color: #0f172a; }
          .btn { display: inline-block; background-color: #0F172A; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo"><span>F</span> Fluc</div>
          </div>
          <div class="content">
            <div class="greeting">Olá, ${name || 'Usuário'}!</div>
            <p class="intro">Bem-vindo ao <strong>Fluc</strong>, seu novo Planejador Financeiro. Preparamos este guia rápido para ajudar você a explorar as principais ferramentas da plataforma e assumir o controle das suas finanças.</p>
            
            <div class="section">
              <div class="section-title">📊 Visão Geral (Dashboard)</div>
              <p>Sua central de controle financeiro. Aqui você pode:</p>
              <ul>
                <li>Acompanhar seus <strong>KPIs</strong> de Receitas, Despesas e Saldo.</li>
                <li>Visualizar gráficos interativos com a evolução do seu fluxo de caixa.</li>
                <li>Entender para onde seu dinheiro está indo e como otimizar seus gastos.</li>
              </ul>
            </div>

            <div class="section">
              <div class="section-title">💸 Gestão de Transações</div>
              <p>Mantenha todos os seus registros organizados e acessíveis:</p>
              <ul>
                <li>Adicione novas receitas e despesas facilmente.</li>
                <li>Categorize os lançamentos (ex: Alimentação, Transporte, Moradia).</li>
                <li>Registre a forma de pagamento (PIX, Cartão de Crédito, Boleto).</li>
                <li>Use filtros e busque por descrições para encontrar o que precisa.</li>
              </ul>
            </div>

            <div class="section">
              <div class="section-title">⚙️ Configurações e Equipe</div>
              <p>Adapte o Fluc às suas necessidades:</p>
              <ul>
                <li>Acesse <strong>Configurações</strong> para editar seu perfil e preferências.</li>
                <li>Na aba <strong>Usuários</strong>, convide membros da sua equipe ou família para colaborar na mesma organização (disponível para perfis de administrador).</li>
              </ul>
            </div>
            
            <div class="section">
              <div class="section-title">💬 Suporte e Ajuda</div>
              <p>Se tiver dúvidas, nossa página de <strong>Ajuda</strong> possui tutoriais detalhados e um FAQ para resolver os problemas mais comuns.</p>
              <p>Você também pode entrar em contato conosco diretamente pelo e-mail: <strong>arcalabs.digital@gmail.com</strong>.</p>
            </div>

            <center>
              <a href="https://fluc.app" class="btn">Acessar o Fluc Agora</a>
            </center>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} Fluc. Todos os direitos reservados.</p>
            <p>Você está recebendo este e-mail porque se cadastrou na plataforma Fluc.</p>
          </div>
        </div>
      </body>
      </html>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'Fluc <onboarding@resend.dev>',
        to: [email],
        subject: 'Bem-vindo ao Fluc seu novo Planejador Financeiro',
        html: htmlContent,
      }),
    })

    if (!res.ok) {
      const errorData = await res.text()
      console.error('Resend API Error:', errorData)
      throw new Error(`Failed to send email: ${errorData}`)
    }

    const data = await res.json()

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    console.error('Edge Function Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
