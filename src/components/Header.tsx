import {
  Search,
  Bell,
  UserIcon,
  LogOut,
  Menu,
  ChevronsUpDown,
  Check,
  Building,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/use-auth'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'
import { CreateWorkspaceDialog } from '@/components/CreateWorkspaceDialog'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'
import { Sidebar } from './Sidebar'
import { useState, useEffect } from 'react'

export function Header() {
  const {
    user,
    profile,
    workspaces,
    currentWorkspace,
    switchWorkspace,
    signOut,
  } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateWorkspaceOpen, setIsCreateWorkspaceOpen] = useState(false)

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [location.pathname])

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchQuery('')
    }
  }

  const getInitials = (name: string) => {
    const parts = name.trim().split(/\s+/)
    if (parts.length === 0 || parts[0] === '') return 'U'
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  const userName =
    profile?.full_name || user?.user_metadata?.full_name || 'Usuário'
  const userInitials = getInitials(userName)
  const avatarUrl = profile?.avatar_url

  const orgName = currentWorkspace?.name || 'Workspace'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="sticky top-0 z-30 w-full bg-[#F8F9FB]/80 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between border-b border-gray-100 gap-2">
      <div className="flex items-center gap-2 flex-1 max-w-xs sm:max-w-md">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden flex-shrink-0 -ml-2 text-gray-600 hover:text-gray-900"
            >
              <Menu className="w-5 h-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-[280px] border-r-0">
            <SheetTitle className="sr-only">Menu Principal</SheetTitle>
            <Sidebar
              className="flex md:flex relative w-full h-full border-none z-50 bg-[#F8F9FB]"
              onNavigate={() => setMobileMenuOpen(false)}
            />
          </SheetContent>
        </Sheet>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
          <Input
            placeholder="Buscar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="pl-9 sm:pl-10 bg-white border-transparent shadow-sm rounded-full h-9 sm:h-11 text-sm focus-visible:ring-1 focus-visible:ring-gray-200 w-full transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="bg-white rounded-full shadow-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900 relative h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
        >
          <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>

        <div className="h-8 w-px bg-gray-200 mx-2 hidden sm:block"></div>

        <div className="flex items-center gap-3 pl-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="hidden sm:flex items-center gap-2 px-3 h-10 border border-gray-100 bg-white hover:bg-gray-50 shadow-sm rounded-full"
              >
                <div className="flex flex-col items-end text-right">
                  <span className="text-sm font-bold text-gray-900 leading-none truncate max-w-[150px]">
                    {orgName}
                  </span>
                  <span className="text-[10px] text-gray-500 capitalize leading-none mt-1">
                    {currentWorkspace?.role || 'Membro'}
                  </span>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-gray-400" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-64 rounded-xl p-2 shadow-lg"
            >
              <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1">
                Seus Workspaces
              </DropdownMenuLabel>
              <div className="max-h-60 overflow-y-auto mt-1 space-y-1">
                {workspaces.map((ws) => (
                  <DropdownMenuItem
                    key={ws.id}
                    onClick={() =>
                      ws.id !== currentWorkspace?.id && switchWorkspace(ws.id)
                    }
                    className="flex items-center justify-between cursor-pointer py-2 px-2 rounded-lg"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary font-bold flex-shrink-0">
                        {ws.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className="font-medium text-sm truncate max-w-[130px]">
                          {ws.name}
                        </span>
                        <span className="text-[10px] text-gray-500 capitalize">
                          {ws.role}
                        </span>
                      </div>
                    </div>
                    {ws.id === currentWorkspace?.id && (
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
              </div>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem
                className="cursor-pointer py-2 px-2 rounded-lg text-primary focus:text-primary focus:bg-primary/5"
                onClick={() => setIsCreateWorkspaceOpen(true)}
              >
                <Building className="mr-2 h-4 w-4" />
                <span className="font-medium">Criar novo Workspace</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Popover>
            <PopoverTrigger asChild>
              <Avatar className="h-10 w-10 border-2 border-white shadow-sm cursor-pointer hover:opacity-90 transition-opacity">
                <AvatarImage
                  src={avatarUrl || undefined}
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
                      src={avatarUrl || undefined}
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

      <CreateWorkspaceDialog
        open={isCreateWorkspaceOpen}
        onOpenChange={setIsCreateWorkspaceOpen}
      />
    </header>
  )
}
