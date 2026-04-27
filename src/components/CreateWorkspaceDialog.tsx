import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface CreateWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateWorkspaceDialog({ open, onOpenChange }: CreateWorkspaceDialogProps) {
  const [name, setName] = useState('')
  const [cnpj, setCnpj] = useState('')
  const [corporateName, setCorporateName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { switchWorkspace } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !cnpj || !corporateName) {
      toast.error('Preencha todos os campos obrigatórios.')
      return
    }

    setIsLoading(true)
    try {
      const { data, error } = await supabase.rpc('create_new_workspace', {
        p_name: name,
        p_cnpj: cnpj,
        p_corporate_name: corporateName
      })

      if (error) throw error

      toast.success('Workspace criado com sucesso!')
      onOpenChange(false)
      setName('')
      setCnpj('')
      setCorporateName('')
      
      // Mudar para o novo workspace
      if (data) {
        await switchWorkspace(data)
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Erro ao criar workspace')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Criar Novo Workspace</DialogTitle>
          <DialogDescription>
            Adicione uma nova empresa para gerenciar finanças de forma isolada. Você terá 7 dias de teste grátis.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Workspace (Fantasia)</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Minha Empresa" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="corporateName">Razão Social</Label>
            <Input id="corporateName" value={corporateName} onChange={(e) => setCorporateName(e.target.value)} required placeholder="Minha Empresa LTDA" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cnpj">CNPJ</Label>
            <Input id="cnpj" value={cnpj} onChange={(e) => setCnpj(e.target.value)} required placeholder="00.000.000/0000-00" />
          </div>
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Cancelar</Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Criar Workspace
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
