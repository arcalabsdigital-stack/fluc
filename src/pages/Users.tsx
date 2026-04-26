import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import AccessDenied from '@/pages/AccessDenied'
import { userService } from '@/services/userService'
import { UserProfile, Role } from '@/lib/types'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Mail, Trash2 } from 'lucide-react'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from '@/components/ui/tooltip'

type ExtendedUserProfile = UserProfile & {
  is_active?: boolean
  must_change_password?: boolean
  avatar_url?: string | null
}

export default function Users() {
  const { role, user: currentUser } = useAuth()
  const [isInviting, setIsInviting] = useState(false)
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [invitePassword, setInvitePassword] = useState('')
  const [inviteRole, setInviteRole] = useState<Role>('colaborador')
  const [showInviteForm, setShowInviteForm] = useState(false)
  const [users, setUsers] = useState<ExtendedUserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (role === 'admin') {
          const data = await userService.getAllUsers()
          setUsers(data)
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        toast.error('Erro ao carregar usuários')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [role])

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await userService.updateUserStatus(userId, isActive)
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_active: isActive } : u)),
      )
      toast.success(
        isActive
          ? 'Usuário ativado com sucesso'
          : 'Usuário desativado com sucesso',
      )
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('Erro ao atualizar status do usuário')
    }
  }

  const handleRoleChange = async (userId: string, newRole: Role) => {
    try {
      await userService.updateUserRole(userId, newRole)
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)),
      )
      toast.success('Função do usuário atualizada com sucesso')
    } catch (error) {
      console.error('Error updating role:', error)
      toast.error('Erro ao atualizar função')
    }
  }

  const handleResendInvite = async (userId: string) => {
    setResendingId(userId)
    try {
      await userService.resendInvite(userId)
      toast.success('Convite reenviado com sucesso!')
    } catch (error: any) {
      toast.error(error.message || 'Erro ao reenviar convite')
    } finally {
      setResendingId(null)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (
      !confirm('Tem certeza que deseja excluir este usuário permanentemente?')
    )
      return

    setDeletingId(userId)
    try {
      await userService.deleteUser(userId)
      setUsers((prev) => prev.filter((u) => u.id !== userId))
      toast.success('Usuário excluído com sucesso')
    } catch (error: any) {
      console.error('Error deleting user:', error)
      toast.error(error.message || 'Erro ao excluir usuário')
    } finally {
      setDeletingId(null)
    }
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 0 || parts[0] === '') return 'U'
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail || !inviteName || !invitePassword) {
      toast.error('Preencha todos os campos, incluindo a senha inicial')
      return
    }
    if (invitePassword.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres')
      return
    }
    setIsInviting(true)
    try {
      await userService.inviteUser(
        inviteEmail,
        inviteName,
        inviteRole,
        invitePassword,
      )
      toast.success('Convite enviado com sucesso!')
      setShowInviteForm(false)
      setInviteEmail('')
      setInviteName('')
      setInvitePassword('')
      setInviteRole('colaborador')
      const data = await userService.getAllUsers()
      setUsers(data)
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar convite')
    } finally {
      setIsInviting(false)
    }
  }

  if (role !== 'admin') {
    return <AccessDenied />
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Gerenciamento de Usuários
          </h1>
          <p className="text-gray-500">
            Gerencie o acesso e permissões dos usuários da sua organização.
          </p>
        </div>
        <Button onClick={() => setShowInviteForm(!showInviteForm)}>
          {showInviteForm ? 'Cancelar' : 'Convidar Usuário'}
        </Button>
      </div>

      {showInviteForm && (
        <div className="bg-white p-6 rounded-xl border shadow-sm animate-fade-in-up">
          <h2 className="text-lg font-semibold mb-4">Novo Convite</h2>
          <form
            onSubmit={handleInvite}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          >
            <div className="space-y-2">
              <Label htmlFor="inviteName">Nome Completo</Label>
              <Input
                id="inviteName"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviteEmail">E-mail</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="invitePassword">Senha Inicial</Label>
              <Input
                id="invitePassword"
                type="text"
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                placeholder="Ex: Senha@123"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="inviteRole">Função</Label>{' '}
              <Select
                value={inviteRole}
                onValueChange={(val) => setInviteRole(val as Role)}
              >
                <SelectTrigger id="inviteRole">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="colaborador">Colaborador</SelectItem>
                  <SelectItem value="visitante">Visitante</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-4 flex justify-end mt-2">
              <Button
                type="submit"
                disabled={isInviting}
                className="w-full md:w-auto"
              >
                {isInviting ? 'Enviando...' : 'Enviar Convite e Criar Acesso'}
              </Button>
            </div>
          </form>{' '}
        </div>
      )}

      <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50 hover:bg-gray-50/50">
                <TableHead>Usuário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Função Atual</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  className={
                    user.is_active === false ? 'opacity-70 bg-gray-50' : ''
                  }
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-gray-200">
                        <AvatarImage
                          src={user.avatar_url || undefined}
                          alt={user.full_name || 'User'}
                        />
                        <AvatarFallback>
                          {getInitials(user.full_name || 'Usuário')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">
                          {user.full_name || 'Sem nome'}
                        </span>
                        <span className="text-xs text-gray-500">
                          ID: {user.id.slice(0, 8)}...
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.is_active !== false
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-red-50 text-red-700 border-red-200'
                      }
                    >
                      {user.is_active !== false ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        user.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 border-purple-200'
                          : user.role === 'colaborador'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : 'bg-gray-50 text-gray-700 border-gray-200'
                      }
                    >
                      {user.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="w-[140px]">
                        <Select
                          defaultValue={user.role}
                          onValueChange={(val) =>
                            handleRoleChange(user.id, val as Role)
                          }
                          disabled={
                            user.id === currentUser?.id ||
                            user.is_active === false
                          }
                        >
                          <SelectTrigger className="h-8">
                            <SelectValue placeholder="Função" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="colaborador">
                              Colaborador
                            </SelectItem>
                            <SelectItem value="visitante">Visitante</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center gap-2 border-l pl-4 border-gray-200">
                        {user.must_change_password && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-gray-500 hover:text-blue-600"
                                onClick={() => handleResendInvite(user.id)}
                                disabled={resendingId === user.id}
                              >
                                <Mail className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Reenviar Convite</TooltipContent>
                          </Tooltip>
                        )}
                        <Switch
                          checked={user.is_active !== false}
                          onCheckedChange={(checked) =>
                            handleStatusChange(user.id, checked)
                          }
                          disabled={user.id === currentUser?.id}
                        />
                        <Label
                          className={
                            user.id === currentUser?.id
                              ? 'text-xs text-gray-400 hidden sm:inline-block'
                              : 'text-xs text-gray-500 cursor-pointer hidden sm:inline-block'
                          }
                          onClick={() => {
                            if (user.id !== currentUser?.id)
                              handleStatusChange(
                                user.id,
                                user.is_active === false,
                              )
                          }}
                        >
                          {user.is_active !== false ? 'Desativar' : 'Ativar'}
                        </Label>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 ml-1"
                              onClick={() => handleDeleteUser(user.id)}
                              disabled={
                                deletingId === user.id ||
                                user.id === currentUser?.id
                              }
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Excluir Usuário</TooltipContent>
                        </Tooltip>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  )
}
