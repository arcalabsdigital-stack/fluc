import { Mail, MessageCircle, FileText } from 'lucide-react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

const Help = () => {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Central de Ajuda</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Suporte por E-mail
            </CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">arcalabs.digital@gmail.com</div>
            <p className="text-xs text-muted-foreground mt-1">
              Nossa equipe responde em até 24 horas úteis.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentação</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">Guias do Fluc</div>
            <p className="text-xs text-muted-foreground mt-1">
              Aprenda a usar todas as funcionalidades.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Comunidade</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">Fórum Fluc</div>
            <p className="text-xs text-muted-foreground mt-1">
              Interaja com outros usuários.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Perguntas Frequentes</CardTitle>
          <CardDescription>
            Encontre respostas rápidas para as dúvidas mais comuns sobre o Fluc.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>
                Como adiciono uma nova transação?
              </AccordionTrigger>
              <AccordionContent>
                Para adicionar uma nova transação, vá até a página "Transações"
                ou clique no botão "Nova Transação" na Dashboard. Preencha os
                detalhes como valor, categoria, data e se é uma receita ou
                despesa.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>
                Posso convidar outras pessoas para minha organização no Fluc?
              </AccordionTrigger>
              <AccordionContent>
                Sim! Se você for um administrador, pode ir até a aba
                "Configurações", selecionar "Usuários" e enviar convites por
                e-mail para que outras pessoas acessem a mesma organização.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>
                Como altero a forma de pagamento de um registro?
              </AccordionTrigger>
              <AccordionContent>
                Você pode editar qualquer transação clicando nela na lista. Na
                janela de edição, você pode modificar a forma de pagamento,
                categoria, valor e outras informações.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>
                Meus dados estão seguros no Fluc?
              </AccordionTrigger>
              <AccordionContent>
                Com certeza. O Fluc utiliza criptografia de ponta a ponta e as
                melhores práticas de segurança do mercado para garantir que suas
                informações financeiras estejam sempre protegidas.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  )
}

export default Help
