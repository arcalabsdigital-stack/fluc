import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import {
  Building2,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
} from 'lucide-react'

export default function SignUp() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [organizationName, setOrganizationName] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const plan = searchParams.get('plan') || undefined

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password || !fullName || !organizationName) {
      toast.error('Por favor, preencha todos os campos.')
      return
    }

    if (password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signUp(
        email,
        password,
        fullName,
        organizationName,
        plan,
      )

      if (error) {
        throw error
      }

      toast.success('Conta criada com sucesso!')
      navigate('/')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center font-bold text-2xl font-display shadow-lg">
            F
          </div>
          <span className="text-3xl font-bold text-gray-900 tracking-tight">
            Fluc
          </span>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 tracking-tight">
          Crie sua conta
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Ou{' '}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary/80 transition-colors"
          >
            faça login se já possui uma conta
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl shadow-gray-200/50 sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nome Completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Nome da Empresa
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  required
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  placeholder="Nome do seu negócio ou workspace"
                />
              </div>
              <p className="mt-1.5 text-xs text-gray-500">
                Este será o nome do seu workspace principal.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                  placeholder="Mínimo de 6 caracteres"
                  minLength={6}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full flex justify-center items-center gap-2 h-11 text-base font-medium rounded-xl mt-2"
              disabled={isLoading}
            >
              {isLoading ? 'Criando conta...' : 'Criar conta'}
              {!isLoading && <ArrowRight className="w-4 h-4" />}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
