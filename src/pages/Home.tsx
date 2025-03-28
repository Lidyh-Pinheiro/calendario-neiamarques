import React, { useState, useEffect } from 'react';
import { Plus, Settings, Calendar, ChevronLeft, LogOut, Users, BarChart, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Checkbox } from '@/components/ui/checkbox';
import { useSettings } from '@/contexts/SettingsContext';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ClientCard from '@/components/ClientCard';
import ClientTable from '@/components/ClientTable';
import SettingsModal from '@/components/SettingsModal';
import { 
  BarChart as RechartsBarChart, 
  Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, 
  ResponsiveContainer, 
  PieChart as RechartsPieChart, 
  Pie, Cell 
} from 'recharts';
import PasswordConfirmDialog from '@/components/PasswordConfirmDialog';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  themeColor: z.string().min(4, {
    message: "Cor inválida",
  }),
  password: z.string().min(1, {
    message: "Senha é obrigatória",
  }),
  active: z.boolean().default(true).optional(),
  description: z.string().optional(),
})

const Home = () => {
  const [openAddClientModal, setOpenAddClientModal] = useState(false);
  const [openSettingsModal, setOpenSettingsModal] = useState(false);
  const [isTableView, setIsTableView] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { toast } = useToast();
  const { clients, createClient, updateClient, deleteClient, shareClient, selectedClient, setSelectedClient } = useSettings();
  const navigate = useNavigate();

  useEffect(() => {
    document.title = "Gestor de Postagens";
  }, []);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      themeColor: "#1E3A8A",
      password: "",
      active: true,
      description: "",
    },
  })

  const handleCloseAddClientModal = () => {
    setOpenAddClientModal(false);
    form.reset();
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    createClient({
      ...values,
      postsCount: 0,
      createdAt: new Date().toISOString(),
    });
    toast({
      title: "Cliente criado com sucesso!",
      description: "O cliente foi adicionado à sua lista.",
    })
    handleCloseAddClientModal();
  }

  const handleSelectClient = (clientId: string) => {
    setSelectedClient(clientId);
    navigate(`/client/${clientId}`);
  };

  const handleEditClient = (client: any) => {
    setSelectedClient(client.id);
    setOpenSettingsModal(true);
  };

  const handleShareClient = (clientId: string) => {
    shareClient(clientId);
    toast({
      title: "Cliente compartilhado com sucesso!",
      description: "O cliente foi compartilhado com sua equipe.",
    })
  };

  const handleDeleteClient = (clientId: string) => {
    setClientToDelete(clientId);
    setShowDeleteConfirm(true);
  };

  const confirmClientDeletion = (password: string) => {
    if (clientToDelete) {
      deleteClient(clientToDelete);
      toast({
        title: "Cliente removido com sucesso!",
        description: "O cliente foi removido da sua lista.",
      })
      setShowDeleteConfirm(false);
      setClientToDelete(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    navigate('/login');
  };

  const activeClientsCount = clients?.filter(client => client.active !== false).length || 0;
  
  const totalPostsCount = clients?.reduce((sum, client) => sum + (client.postsCount || 0), 0) || 0;
  
  const chartData = clients?.map(client => ({
    name: client.name.length > 10 ? client.name.substring(0, 10) + '...' : client.name,
    posts: client.postsCount || 0,
    color: client.themeColor
  })) || [];
  
  chartData.sort((a, b) => b.posts - a.posts);

  const COLORS = chartData.map(item => item.color);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Gerenciamento de Clientes</h1>
        <div className="flex items-center space-x-3">
          <Button
            variant="neutral"
            size="sm"
            onClick={handleLogout}
            className="rounded-[10px]"
          >
            <LogOut className="h-4 w-4 mr-1" />
            Sair
          </Button>
          <Button 
            variant="neutral" 
            onClick={() => setOpenSettingsModal(true)}
            className="rounded-[10px]"
          >
            <Settings className="h-4 w-4 mr-1" />
            Configurações
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeClientsCount}</div>
            <p className="text-xs text-muted-foreground">
              Total de clientes gerenciados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agendas Ativas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPostsCount}</div>
            <p className="text-xs text-muted-foreground">
              Total de posts agendados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Média de Posts</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clients && clients.length > 0 
                ? (totalPostsCount / clients.length).toFixed(1) 
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground">
              Posts por cliente
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">Clientes</h2>
        <div className="flex items-center space-x-3">
          <Button 
            variant="neutral" 
            size="sm" 
            onClick={() => setIsTableView(!isTableView)}
            className="rounded-[10px]"
          >
            {isTableView ? "Visualização em Card" : "Visualização em Tabela"}
          </Button>
          <Button 
            variant="default"
            onClick={() => setOpenAddClientModal(true)}
            className="rounded-[10px]"
          >
            <Plus className="w-4 h-4 mr-1" />
            Adicionar Cliente
          </Button>
        </div>
      </div>

      {!clients || clients.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          Nenhum cliente cadastrado
        </div>
      ) : (
        <>
          {isTableView ? (
            <ClientTable
              clients={clients}
              onSelect={handleSelectClient}
              onEdit={handleEditClient}
              onShare={handleShareClient}
              onDelete={handleDeleteClient}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {clients.map((client) => (
                <ClientCard
                  key={client.id}
                  client={client}
                  onSelect={() => handleSelectClient(client.id)}
                  onEdit={() => handleEditClient(client)}
                  onShare={() => handleShareClient(client.id)}
                  onDelete={() => handleDeleteClient(client.id)}
                />
              ))}
            </div>
          )}
        </>
      )}

      {chartData.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Ranking de Engajamento</CardTitle>
            <CardDescription>Quantidade de posts por cliente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart 
                  data={chartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    height={50}
                    fontSize={11}
                  />
                  <YAxis fontSize={11} />
                  <Tooltip />
                  <Bar 
                    dataKey="posts" 
                    name="Posts" 
                    radius={[4, 4, 0, 0]}
                    isAnimationActive={true}
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={openAddClientModal} onOpenChange={setOpenAddClientModal}>
        <DialogContent className="sm:max-w-[425px] rounded-[10px]">
          <DialogHeader>
            <DialogTitle>Adicionar Cliente</DialogTitle>
            <DialogDescription>
              Crie um novo cliente para gerenciar a agenda de postagens.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do cliente" {...field} />
                    </FormControl>
                    <FormDescription>
                      Este é o nome que será exibido na agenda.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="themeColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cor</FormLabel>
                    <FormControl>
                      <Input type="color" defaultValue="#1E3A8A" {...field} />
                    </FormControl>
                    <FormDescription>
                      Escolha uma cor para identificar o cliente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Senha do cliente" {...field} />
                    </FormControl>
                    <FormDescription>
                      Crie uma senha para proteger os dados do cliente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Escreva uma descrição sobre o cliente."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Adicione uma descrição para ajudar a identificar o cliente.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-md border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Ativo</FormLabel>
                      <FormDescription>
                        Defina se o cliente está ativo ou não.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <DialogFooter className="flex flex-row gap-3 justify-end">
                <Button type="button" variant="neutral" onClick={handleCloseAddClientModal} className="rounded-[10px]">Cancelar</Button>
                <Button type="submit" className="rounded-[10px]">Salvar</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <SettingsModal
        open={openSettingsModal}
        onOpenChange={setOpenSettingsModal}
        initialTab="clients"
        editClientId={selectedClient}
      />

      <PasswordConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={confirmClientDeletion}
        title="Confirmação de exclusão de cliente"
        description="Esta ação é irreversível. Por favor, digite a senha do administrador para confirmar a exclusão."
      />
    </div>
  );
};

export default Home;
