import { useState, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { format } from 'date-fns'

export function NotificationsBell() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (!user) return

    supabase.rpc('process_recurring_transactions' as any).then()
    fetchNotifications()

    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev])
          setUnreadCount((prev) => prev + 1)
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user])

  const fetchNotifications = async () => {
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user?.id)
      .order('created_at', { ascending: false })
      .limit(15)

    if (data) {
      setNotifications(data)
      setUnreadCount(data.filter((n) => !n.is_read).length)
    }
  }

  const markAsRead = async (id: string) => {
    await supabase.from('notifications').update({ is_read: true }).eq('id', id)
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    )
    setUnreadCount((prev) => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    if (!user) return
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
    setNotifications(notifications.map((n) => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  if (!user) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="h-14 w-14 rounded-full shadow-lg relative bg-white hover:bg-gray-50 border-gray-200"
          >
            <Bell className="h-6 w-6 text-gray-700" />
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          className="w-80 p-0 rounded-2xl shadow-xl border-gray-100 mb-2"
        >
          <div className="flex items-center justify-between p-4 border-b border-gray-50">
            <h3 className="font-semibold text-gray-900">Notificações</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="h-auto px-2 py-1 text-xs text-primary hover:text-primary/80"
              >
                Marcar lidas
              </Button>
            )}
          </div>
          <div className="max-h-[350px] overflow-y-auto p-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center p-4">
                Nenhuma notificação no momento.
              </p>
            ) : (
              <div className="flex flex-col gap-1">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl cursor-pointer transition-colors ${n.is_read ? 'hover:bg-gray-50' : 'bg-blue-50/50 hover:bg-blue-50'}`}
                    onClick={() => !n.is_read && markAsRead(n.id)}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4
                        className={`text-sm font-medium ${n.is_read ? 'text-gray-700' : 'text-gray-900'}`}
                      >
                        {n.title}
                      </h4>
                      {!n.is_read && (
                        <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{n.message}</p>
                    <span className="text-[10px] text-gray-400 font-medium">
                      {format(new Date(n.created_at), 'dd/MM HH:mm')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
