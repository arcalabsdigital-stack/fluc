import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Wallet,
  LifeBuoy,
  Settings,
  LogOut,
  Users,
  History,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'

const SidebarItem = ({
  icon: Icon,
  label,
  to,
  isActive,
  badge,
  onClick,
}: {
  icon: any
  label: string
  to: string
  isActive: boolean
  badge?: string
  onClick?: () => void
}) => (
  <Link
    to={to}
    onClick={onClick}
    className={cn(
      'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group hover:bg-white hover:shadow-sm',
      isActive
        ? 'text-primary font-semibold bg-white shadow-sm'
        : 'text-gray-500',
    )}
  >
    <Icon
      className={cn(
        'w-5 h-5',
        isActive ? 'text-primary' : 'text-gray-400 group-hover:text-primary',
      )}
    />
    <span className="flex-1">{label}</span>
    {badge && (
      <Badge
        variant="secondary"
        className="bg-red-100 text-red-500 hover:bg-red-200 h-5 w-5 p-0 flex items-center justify-center rounded-full text-xs"
      >
        {badge}
      </Badge>
    )}
  </Link>
)

export function Sidebar({
  className,
  onNavigate,
}: {
  className?: string
  onNavigate?: () => void
}) {
  const location = useLocation()
  const pathname = location.pathname
  const { signOut, role, profile } = useAuth()
  const navigate = useNavigate()

  const getOrgName = () => {
    const org = profile?.organizations as any
    if (!org) return 'Carregando...'
    return Array.isArray(org) ? org[0]?.name : org.name
  }
  const orgName = getOrgName()

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success('Você saiu com sucesso')
      navigate('/login')
    } catch (error) {
      toast.error('Erro ao sair')
    }
  }

  const getRoleLabel = () => {
    switch (role) {
      case 'admin':
        return 'Administrador'
      case 'colaborador':
        return 'Colaborador'
      case 'visitante':
        return 'Visitante'
      default:
        return ''
    }
  }

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen w-[280px] bg-[#F8F9FB] border-r border-gray-100 p-6 flex flex-col z-40 hidden md:flex',
        className,
      )}
    >
      {/* Brand & Workspace */}
      <div className="flex flex-col mb-10 px-2 gap-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-black text-white rounded-lg flex items-center justify-center font-bold text-xl font-display">
            F
          </div>
          <span className="text-2xl font-bold text-gray-900 tracking-tight">
            Fluc
          </span>
        </div>
        {profile && (
          <div className="px-1 mt-2 bg-white/50 rounded-lg py-2 border border-gray-100">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">
              Workspace
            </span>
            <span className="text-sm font-semibold text-gray-800 truncate block">
              {orgName}
            </span>
          </div>
        )}
      </div>

      {/* Menu */}
      <div className="space-y-6 flex-1 overflow-y-auto no-scrollbar">
        <div>
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Menu
          </div>
          <div className="space-y-1">
            <SidebarItem
              icon={LayoutDashboard}
              label="Início"
              to="/"
              isActive={pathname === '/'}
              onClick={onNavigate}
            />
            <SidebarItem
              icon={Wallet}
              label="Transações"
              to="/payments"
              isActive={pathname === '/payments'}
              onClick={onNavigate}
            />
            {role === 'admin' && (
              <SidebarItem
                icon={Users}
                label="Gerenciar Usuários"
                to="/users"
                isActive={pathname === '/users'}
                onClick={onNavigate}
              />
            )}
            <SidebarItem
              icon={History}
              label="Histórico"
              to="/history"
              isActive={pathname === '/history'}
              onClick={onNavigate}
            />
          </div>
        </div>

        <div>
          <div className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Suporte
          </div>
          <div className="space-y-1">
            <SidebarItem
              icon={LifeBuoy}
              label="Ajuda"
              to="/help"
              isActive={pathname === '/help'}
              onClick={onNavigate}
            />
            <SidebarItem
              icon={Settings}
              label="Configurações"
              to="/settings"
              isActive={pathname === '/settings'}
              onClick={onNavigate}
            />
          </div>
        </div>
      </div>

      {/* Role Indicator & Logout */}
      <div className="mt-auto space-y-2">
        {role && role !== 'visitante' && (
          <div className="px-4 py-2 bg-gray-100 rounded-lg text-center">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider block mb-1">
              Acesso Atual
            </span>
            <span className="text-sm font-bold text-gray-900">
              {getRoleLabel()}
            </span>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-red-50 rounded-xl transition-colors w-full"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </aside>
  )
}
