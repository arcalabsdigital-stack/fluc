import { useState, useEffect } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

function isValidCPF(cpf: string) {
  cpf = cpf.replace(/[^\d]+/g, '')
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
  let sum = 0,
    rest
  for (let i = 1; i <= 9; i++)
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i)
  rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  if (rest !== parseInt(cpf.substring(9, 10))) return false
  sum = 0
  for (let i = 1; i <= 10; i++)
    sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i)
  rest = (sum * 10) % 11
  if (rest === 10 || rest === 11) rest = 0
  if (rest !== parseInt(cpf.substring(10, 11))) return false
  return true
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { currentWorkspace, loading, user, profile, reloadProfile } = useAuth()
  const [document, setDocument] = useState('')
  const [fullName, setFullName] = useState('')
  const [corporateName, setCorporateName] = useState('')
  const [phone, setPhone] = useState('')
  const [docType, setDocType] = useState<'CPF' | 'CNPJ' | null>(null)
  const [apiStatus, setApiStatus] = useState<
    | 'idle'
    | 'validating'
    | 'success_cnpj'
    | 'success_cpf'
    | 'error_cnpj_404'
    | 'error_cnpj_503'
    | 'error_cnpj_400'
    | 'error_cpf_invalid'
  >('idle')
  const [isManualEdit, setIsManualEdit] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const raw = document.replace(/\D/g, '')
    if (raw.length === 11) {
      setDocType('CPF')
      const handler = setTimeout(() => {
        setApiStatus('validating')
        if (isValidCPF(raw)) {
          setApiStatus('success_cpf')
          setIsManualEdit(true)
        } else {
          setApiStatus('error_cpf_invalid')
        }
      }, 300)
      return () => clearTimeout(handler)
    } else if (raw.length === 14) {
      setDocType('CNPJ')
      const handler = setTimeout(() => {
        validateCNPJ(raw)
      }, 300)
      return () => clearTimeout(handler)
    } else {
      setDocType(null)
      setApiStatus('idle')
    }
  }, [document])

  const validateCNPJ = async (raw: string) => {
    setApiStatus('validating')
    try {
      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${raw}`)
      if (res.ok) {
        const data = await res.json()
        setCorporateName(
          data.razao_social || data.nome_fantasia || data.nome || '',
        )
        setApiStatus('success_cnpj')
        setIsManualEdit(false)
      } else if (res.status === 404) {
        setApiStatus('error_cnpj_404')
        setIsManualEdit(true)
      } else if (res.status === 400) {
        setApiStatus('error_cnpj_400')
        setIsManualEdit(true)
      } else {
        setApiStatus('error_cnpj_503')
        setIsManualEdit(true)
      }
    } catch (err) {
      setApiStatus('error_cnpj_503')
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
  const isValidDocStatus = [
    'success_cnpj',
    'success_cpf',
    'error_cnpj_404',
    'error_cnpj_503',
  ].includes(apiStatus)

  const isValid =
    (rawDoc.length === 11 || rawDoc.length === 14) &&
    isValidDocStatus &&
    fullName.trim().length >= 3 &&
    rawPhone.length >= 10 &&
    (docType === 'CNPJ' ? corporateName.trim().length >= 3 : true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValid || isSubmitting || !currentWorkspace || !user) return
    setIsSubmitting(true)

    try {
      const tipoDoc = rawDoc.length === 14 ? 'CNPJ' : 'CPF'
      const orgName = docType === 'CNPJ' ? corporateName : fullName
      const razaoSocialOuNome = orgName.trim() || 'Minha Organização'

      const { error: orgError } = await supabase
        .from('organizations')
        .update({
          name: razaoSocialOuNome,
          cnpj: rawDoc,
          corporate_name: docType === 'CNPJ' ? corporateName : null,
        })
        .eq('id', currentWorkspace.id)

      if (orgError) throw orgError

      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          organization_id: currentWorkspace.id,
          razao_social_ou_nome: razaoSocialOuNome,
          cnpj_ou_cpf: rawDoc,
          tipo_documento: tipoDoc,
          full_name: fullName,
          telefone: rawPhone,
        })
        .eq('id', user.id)

      if (profileError) throw profileError

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

      toast.success('Workspace criado com sucesso!')

      setTimeout(async () => {
        if (reloadProfile) {
          await reloadProfile()
        }
        setTimeout(() => {
          navigate('/')
        }, 300)
      }, 500)
    } catch (error) {
      console.error(error)
      toast.error('Erro ao salvar os dados. Tente novamente.')
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FB] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[400px] w-full bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 bg-slate-200 rounded-xl mb-4"></div>
            <div className="h-6 bg-slate-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-2/3 mb-8"></div>
          </div>
          <div className="space-y-5 animate-pulse">
            <div>
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
              <div className="h-11 bg-slate-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
              <div className="h-11 bg-slate-200 rounded w-full"></div>
            </div>
            <div>
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-2"></div>
              <div className="h-11 bg-slate-200 rounded w-full"></div>
            </div>
            <div className="h-11 bg-slate-200 rounded w-full mt-6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (profile?.cnpj_ou_cpf) return <Navigate to="/" replace />

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
              {apiStatus === 'validating' && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            {apiStatus === 'success_cnpj' && (
              <div className="flex items-center text-sm text-green-600 bg-green-50 p-2 rounded-md mt-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Dados encontrados
              </div>
            )}
            {apiStatus === 'success_cpf' && (
              <div className="flex items-center text-sm text-green-600 bg-green-50 p-2 rounded-md mt-2">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                CPF válido
              </div>
            )}
            {apiStatus === 'error_cpf_invalid' && (
              <div className="flex items-center text-sm text-red-600 bg-red-50 p-2 rounded-md mt-2">
                <AlertCircle className="w-4 h-4 mr-2" />
                CPF inválido
              </div>
            )}
            {apiStatus === 'error_cnpj_404' && (
              <div className="flex items-center text-sm text-yellow-600 bg-yellow-50 p-2 rounded-md mt-2">
                <AlertCircle className="w-4 h-4 mr-2" />
                CNPJ não encontrado na Receita Federal
              </div>
            )}
            {apiStatus === 'error_cnpj_503' && (
              <div className="flex items-center justify-between text-sm text-red-600 bg-red-50 p-2 rounded-md mt-2">
                <div className="flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Serviço temporariamente indisponível
                </div>
                <button
                  type="button"
                  onClick={() => validateCNPJ(rawDoc)}
                  className="text-red-700 hover:text-red-800"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            )}
            {apiStatus === 'error_cnpj_400' && (
              <div className="flex items-center text-sm text-red-600 bg-red-50 p-2 rounded-md mt-2">
                <AlertCircle className="w-4 h-4 mr-2" />
                CNPJ inválido
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="fullName">Nome Completo</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Digite seu nome completo"
              className="min-h-[44px] mt-1"
              disabled={isSubmitting}
            />
          </div>

          {docType === 'CNPJ' && (
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label htmlFor="corporateName">Razão Social</Label>
                {apiStatus === 'success_cnpj' && !isManualEdit && (
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
                id="corporateName"
                value={corporateName}
                onChange={(e) => setCorporateName(e.target.value)}
                placeholder="Será preenchido automaticamente"
                readOnly={apiStatus === 'success_cnpj' && !isManualEdit}
                className={cn(
                  apiStatus === 'success_cnpj' && !isManualEdit
                    ? 'bg-slate-50 text-slate-600 focus-visible:ring-0 cursor-default'
                    : '',
                  'min-h-[44px]',
                )}
                disabled={isSubmitting}
              />
            </div>
          )}

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
