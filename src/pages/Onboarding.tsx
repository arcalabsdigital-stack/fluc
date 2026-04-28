import { useState, useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Onboarding() {
  const { currentWorkspace, loading } = useAuth()
  const [document, setDocument] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [phone, setPhone] = useState('')
  const [apiStatus, setApiStatus] = useState<
    'idle' | 'loading' | 'success' | 'error_404' | 'error_503' | 'error_400'
  >('idle')
  const [isManualEdit, setIsManualEdit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const raw = document.replace(/\D/g, '')
    if (raw.length === 11 || raw.length === 14) {
      const handler = setTimeout(() => {
        fetchData(raw)
      }, 300)
      return () => clearTimeout(handler)
    } else {
      setApiStatus('idle')
    }
  }, [document])

  const fetchData = async (raw: string) => {
    setApiStatus('loading')
    try {
      const isCnpj = raw.length === 14
      const url = isCnpj
        ? `https://brasilapi.com.br/api/cnpj/v1/${raw}`
        : `https://brasilapi.com.br/api/cpf/v1/${raw}`

      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setCompanyName(
          isCnpj
            ? data.razao_social || data.nome_fantasia || data.nome || ''
            : data.nome || '',
        )
        setApiStatus('success')
        setIsManualEdit(false)
      } else if (res.status === 404) {
        setApiStatus('error_404')
        setIsManualEdit(true)
      } else if (res.status === 400) {
        setApiStatus('error_400')
      } else {
        setApiStatus('error_503')
        setIsManualEdit(true)
      }
    } catch (err) {
      setApiStatus('error_503')
      setIsManualEdit(true)
    }
  }

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '')
    if (val.length <= 11) {
      val = val.replace(/(\d{3})(\d)/, '$1.$2')
      val = val.replace(/(\d{3})(\d)/, '$1.$2')
      val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2')
    } else {
      val = val.slice(0, 14)
      val = val.replace(/(\d{2})(\d)/, '$1.$2')
      val = val.replace(/(\d{3})(\d)/, '$1.$2')
      val = val.replace(/(\d{3})(\d)/, '$1/$2')
      val = val.replace(/(\d{4})(\d{1,2})$/, '$1-$2')
    }
    setDocument(val)
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 11)
    if (val.length === 0) {
      setPhone('')
      return
    }
    if (val.length <= 2) {
      setPhone(`(${val}`)
      return
    }
    if (val.length <= 6) {
      setPhone(`(${val.slice(0, 2)}) ${val.slice(2)}`)
      return
    }
    if (val.length <= 10) {
      setPhone(`(${val.slice(0, 2)}) ${val.slice(2, 6)}-${val.slice(6)}`)
      return
    }
    setPhone(`(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`)
  }

  const rawDoc = document.replace(/\D/g, '')
  const rawPhone = phone.replace(/\D/g, '')
  const isValid =
    (rawDoc.length === 11 || rawDoc.length === 14) &&
    companyName.trim().length >= 3 &&
    rawPhone.length >= 10 &&
    apiStatus !== 'error_400' &&
    apiStatus !== 'loading'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isSubmitting || !currentWorkspace) return
    setIsSubmitting(true)

    try {
      const { error: orgError } = await supabase
        .from('organizations')
        .update({
          cnpj: rawDoc,
          corporate_name: companyName,
          name: companyName,
        })
        .eq('id', currentWorkspace.id)

      if (orgError) throw orgError

      await supabase
        .from('subscriptions')
        .update({
          status: 'trial',
          trial_start: new Date().toISOString(),
          trial_end: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000,
          ).toISOString(),
        })
        .eq('organization_id', currentWorkspace.id)

      await supabase.auth.updateUser({
        data: { phone: rawPhone },
      })

      toast.success('Workspace criado! Você tem 7 dias de trial')

      setTimeout(() => {
        window.location.href = '/'
      }, 1000)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar os dados. Tente novamente.')
      setIsSubmitting(false)
    }
  }

  if (loading) return null
  if (currentWorkspace?.cnpj) return <Navigate to="/" replace />

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-[400px] w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center text-2xl font-bold">
              F
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Complete seu perfil
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Precisamos de alguns dados para criar seu workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <Label htmlFor="document">CNPJ ou CPF</Label>
            <div className="relative mt-1">
              <Input
                id="document"
                value={document}
                onChange={handleDocumentChange}
                placeholder="Digite seu CNPJ ou CPF"
                className="min-h-[44px]"
                disabled={isSubmitting}
              />
              {apiStatus === 'loading' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            {apiStatus === 'success' && (
              <div className="flex items-center text-sm text-green-600 bg-green-50 p-2 rounded-md mt-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Dados encontrados
              </div>
            )}
            {apiStatus === 'error_404' && (
              <div className="flex items-center text-sm text-yellow-600 bg-yellow-50 p-2 rounded-md mt-2">
                <AlertCircle className="w-4 h-4 mr-2" />
                CNPJ/CPF não encontrado na Receita Federal
              </div>
            )}
            {apiStatus === 'error_503' && (
              <div className="flex items-center justify-between text-sm text-red-600 bg-red-50 p-2 rounded-md mt-2">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Serviço temporariamente indisponível
                </div>
                <button
                  type="button"
                  onClick={() => fetchData(rawDoc)}
                  className="text-red-700 hover:text-red-800"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}
            {apiStatus === 'error_400' && (
              <div className="flex items-center text-sm text-red-600 bg-red-50 p-2 rounded-md mt-2">
                <AlertCircle className="w-4 h-4 mr-2" />
                CNPJ ou CPF inválido
              </div>
            )}
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <Label htmlFor="companyName">Razão Social</Label>
              {apiStatus === 'success' && !isManualEdit && (
                <button
                  type="button"
                  onClick={() => setIsManualEdit(true)}
                  className="text-xs text-primary hover:underline"
                >
                  Editar
                </button>
              )}
            </div>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Será preenchido automaticamente"
              readOnly={apiStatus === 'success' && !isManualEdit}
              className={cn(
                apiStatus === 'success' && !isManualEdit
                  ? 'bg-slate-50 text-slate-600 focus-visible:ring-0 cursor-default'
                  : '',
                'min-h-[44px]',
              )}
              disabled={isSubmitting}
            />
          </div>

          <div>
            <Label htmlFor="phone">Telefone</Label>
            <Input
              id="phone"
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(11) 99999-9999"
              className="min-h-[44px] mt-1"
              disabled={isSubmitting}
            />
          </div>

          <Button
            type="submit"
            className="w-full min-h-[44px] mt-6"
            disabled={!isValid || isSubmitting}
          >
            {isSubmitting ? 'Criando Workspace...' : 'Criar Workspace'}
          </Button>
        </form>
      </div>
    </div>
  )
}
