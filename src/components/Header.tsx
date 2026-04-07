import { Search, Bell, FileText, UserIcon, LogOut } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useNavigate } from 'react-router-dom'

export function Header() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  const userName =
    profile?.full_name || user?.user_metadata?.full_name || 'Usuário'
  const userInitials = userName.substring(0, 2).toUpperCase()
  const avatarUrl =
    profile?.avatar_url ||
    `https://img.usecurling.com/ppl/medium?gender=male&seed=${user?.id}`

  const getOrgName = () => {
    const org = profile?.organizations as any
    if (!org) return 'Workspace'
    return Array.isArray(org) ? org[0]?.name : org.name
  }
  const orgName = getOrgName()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-[#F8F9FB]/80 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b border-gray-100">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Buscar..."
            className="pl-10 bg-white border-transparent shadow-sm rounded-full h-11 focus-visible:ring-1 focus-visible:ring-gray-200"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="bg-white rounded-full shadow-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 relative"
        >
          <FileText className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="bg-white rounded-full shadow-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 relative"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>

        <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-gray-900">{userName}</div>
            <div className="text-xs text-gray-500 capitalize flex items-center justify-end gap-1">
              <span>{profile?.role || 'Membro'}</span>
              <span>•</span>
              <span className="truncate max-w-[120px] font-medium">
                {orgName}
              </span>
            </div>
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                <AvatarImage
                  src={avatarUrl}
                  alt={userName}
                  className="object-cover"
                />
                <AvatarFallback>{userInitials}</AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              className="w-56 p-2 rounded-xl border border-gray-100 shadow-lg"
            >
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-3 p-2 mb-1">
                  <Avatar className="h-9 w-9 border border-gray-100">
                    <AvatarImage
                      src={avatarUrl}
                      alt={userName}
                      className="object-cover"
                    />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-medium truncate text-gray-900">
                      {userName}
                    </span>
                    <span className="text-xs text-gray-500 truncate">
                      {user?.email}
                    </span>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider truncate mt-1">
                      {orgName}
                    </span>
                  </div>
                </div>
                <div className="h-px bg-gray-100 my-1" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-9 font-medium text-gray-700"
                  onClick={() => navigate('/settings')}
                >
                  <UserIcon className="mr-2 h-4 w-4" />
                  Meu Perfil
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm h-9 font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleSignOut}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sair
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  )
}
