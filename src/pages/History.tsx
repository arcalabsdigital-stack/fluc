import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { auditService, AuditLog } from '@/services/auditService'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Activity, Plus, Trash2, Edit, UserPlus, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const getActionIcon = (action: string, entity: string) => {
  if (action === 'CREATE' && entity === 'USER')
    return <UserPlus className="w-4 h-4 text-blue-500" />
  if (action === 'CREATE') return <Plus className="w-4 h-4 text-green-500" />
  if (action === 'DELETE') return <Trash2 className="w-4 h-4 text-red-500" />
  if (action === 'UPDATE') return <Edit className="w-4 h-4 text-orange-500" />
  return <Activity className="w-4 h-4 text-gray-500" />
}

const translateAction = (action: string) => {
  const map: Record<string, string> = {
    CREATE: 'Criou',
    UPDATE: 'Atualizou',
    DELETE: 'Excluiu',
  }
  return map[action] || action
}

const translateEntity = (entity: string) => {
  const map: Record<string, string> = {
    TRANSACTION: 'transação',
    USER: 'usuário',
  }
  return map[entity] || entity.toLowerCase()
}

export default function History() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const { role } = useAuth()

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      const data = await auditService.getLogs()
      setLogs(data)
    } catch (error) {
      console.error('Failed to fetch logs', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-gray-900">
            Histórico de Atividades
          </h1>
          <p className="text-gray-500 mt-1">
            {role === 'admin'
              ? 'Acompanhe todas as ações realizadas na sua organização.'
              : 'Acompanhe o histórico das suas atividades.'}
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-gray-100">
            {loading ? (
              <div className="p-8 text-center text-gray-500">
                Carregando histórico...
              </div>
            ) : logs.length === 0 ? (
              <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                <Clock className="w-8 h-8 mb-3 text-gray-300" />
                <p>Nenhuma atividade registrada ainda.</p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center gap-4 p-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
                    {getActionIcon(log.action, log.entity_type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">
                      <span className="font-semibold">
                        {log.profiles?.full_name || 'Sistema'}
                      </span>{' '}
                      <span className="text-gray-500">
                        {translateAction(log.action).toLowerCase()}
                      </span>{' '}
                      <span className="font-medium text-gray-700">
                        {translateEntity(log.entity_type)}
                      </span>{' '}
                      <span className="text-gray-900 font-medium">
                        "{log.entity_name}"
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(
                        new Date(log.created_at),
                        "d 'de' MMMM 'às' HH:mm",
                        { locale: ptBR },
                      )}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
