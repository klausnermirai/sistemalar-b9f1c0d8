import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useUserRole } from "@/hooks/useUserRole";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Trash2, Building2, Users, KeyRound, User, BedDouble, Plus, Pencil } from "lucide-react";
import { useRooms, useCreateRoom, useUpdateRoom, useDeleteRoom, Room } from "@/hooks/useRooms";

const orgTypeLabels: Record<string, string> = {
  obra_unida: "Obra Unida (ILPI)",
  conselho_central: "Conselho Central",
  conselho_metropolitano: "Conselho Metropolitano",
  conselho_nacional: "Conselho Nacional",
};

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  social_worker: "Assistente Social",
  psicologo: "Psicologia",
  nutricionista: "Nutricionista",
  coordinator: "Coordenador",
  viewer: "Visualizador",
};

interface OrgData {
  id: string;
  name: string;
  org_type: string;
  cnpj: string | null;
  city: string | null;
  state: string | null;
  central_council_name: string | null;
  metropolitan_council_name: string | null;
}

interface OrgMember {
  user_id: string;
  role: string;
  is_primary: boolean;
  full_name: string | null;
  role_title: string | null;
}

export default function Settings() {
  const { user, userOrgId } = useAuth();
  const { isAdmin, role, canAccess } = useUserRole();
  const { toast } = useToast();

  const [org, setOrg] = useState<OrgData | null>(null);
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviting, setInviting] = useState(false);

  // Org form state
  const [orgName, setOrgName] = useState("");
  const [orgCnpj, setOrgCnpj] = useState("");
  const [orgCity, setOrgCity] = useState("");
  const [orgState, setOrgState] = useState("");
  const [orgCentral, setOrgCentral] = useState("");
  const [orgMetro, setOrgMetro] = useState("");
  const [orgWhatsapp, setOrgWhatsapp] = useState("");

  // Invite form
  const [invEmail, setInvEmail] = useState("");
  const [invName, setInvName] = useState("");
  const [invRole, setInvRole] = useState("social_worker");
  const [invRoleTitle, setInvRoleTitle] = useState("");
  const [invPassword, setInvPassword] = useState("");

  // My account - change password
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Admin reset password dialog
  const [resetTarget, setResetTarget] = useState<OrgMember | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetting, setResetting] = useState(false);

  // Estrutura do Lar
  const [maleBeds, setMaleBeds] = useState(30);
  const [femaleBeds, setFemaleBeds] = useState(22);
  const [maleRooms, setMaleRooms] = useState(12);
  const [femaleRooms, setFemaleRooms] = useState(8);
  const [savingStructure, setSavingStructure] = useState(false);
  const { data: rooms = [] } = useRooms();
  const createRoom = useCreateRoom();
  const updateRoom = useUpdateRoom();
  const deleteRoom = useDeleteRoom();
  const [roomOpen, setRoomOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [roomForm, setRoomForm] = useState({ identifier: "", type: "masculino", beds: 1, observations: "" });

  const [editRoleTarget, setEditRoleTarget] = useState<OrgMember | null>(null);
  const [editRoleValue, setEditRoleValue] = useState("");
  const [editingRole, setEditingRole] = useState(false);

  useEffect(() => {
    if (userOrgId) {
      loadOrg();
      if (isAdmin) loadMembers();
    }
  }, [userOrgId, isAdmin]);

  async function loadOrg() {
    const { data } = await supabase
      .from("organizations")
      .select("*")
      .eq("id", userOrgId!)
      .single();
    if (data) {
      setOrg(data as OrgData);
      setOrgName(data.name);
      setOrgCnpj(data.cnpj || "");
      setOrgCity(data.city || "");
      setOrgState((data as any).state || "");
      setOrgCentral(data.central_council_name || "");
      setOrgMetro(data.metropolitan_council_name || "");
      setOrgWhatsapp((data as any).mural_whatsapp_phone || "");
      setMaleBeds((data as any).total_male_beds ?? 30);
      setFemaleBeds((data as any).total_female_beds ?? 22);
      setMaleRooms((data as any).total_male_rooms ?? 12);
      setFemaleRooms((data as any).total_female_rooms ?? 8);
    }
  }

  async function loadMembers() {
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, role, is_primary")
      .eq("organization_id", userOrgId!);
    if (!roles) return;

    const userIds = roles.map((r) => r.user_id);
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, role_title")
      .in("user_id", userIds);

    const merged: OrgMember[] = roles.map((r) => {
      const prof = profiles?.find((p) => p.user_id === r.user_id);
      return { ...r, full_name: prof?.full_name || null, role_title: prof?.role_title || null };
    });
    setMembers(merged);
  }

  async function handleSaveOrg(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      const { error } = await supabase
        .from("organizations")
        .update({
          name: orgName,
          cnpj: orgCnpj.replace(/\D/g, "") || null,
          city: orgCity || null,
          state: orgState || null,
          central_council_name: orgCentral || null,
          metropolitan_council_name: orgMetro || null,
          mural_whatsapp_phone: orgWhatsapp || null,
        } as any)
        .eq("id", userOrgId!);
      if (error) throw error;
      toast({ title: "Dados salvos com sucesso!" });
      loadOrg();
    } catch (err: any) {
      toast({ title: "Erro ao salvar", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    setInviting(true);
    try {
      const { data, error } = await supabase.functions.invoke("invite-user", {
        body: { email: invEmail, password: invPassword, full_name: invName, role: invRole, role_title: invRoleTitle },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Usuário convidado com sucesso!" });
      setInviteOpen(false);
      setInvEmail(""); setInvName(""); setInvRole("social_worker"); setInvRoleTitle(""); setInvPassword("");
      loadMembers();
    } catch (err: any) {
      toast({ title: "Erro ao convidar", description: err.message, variant: "destructive" });
    } finally {
      setInviting(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (userId === user?.id) {
      toast({ title: "Você não pode remover a si mesmo", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("organization_id", userOrgId!);
      if (error) throw error;
      toast({ title: "Usuário removido da organização" });
      loadMembers();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  }

  async function handleChangeOwnPassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "As senhas não coincidem", variant: "destructive" });
      return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Senha deve ter pelo menos 6 caracteres", variant: "destructive" });
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Senha alterada com sucesso!" });
      setNewPassword(""); setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "Erro ao alterar senha", description: err.message, variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  }

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetTarget) return;
    setResetting(true);
    try {
      const { data, error } = await supabase.functions.invoke("reset-user-password", {
        body: { user_id: resetTarget.user_id, new_password: resetPassword },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast({ title: "Senha redefinida com sucesso!" });
      setResetTarget(null); setResetPassword("");
    } catch (err: any) {
      toast({ title: "Erro ao redefinir senha", description: err.message, variant: "destructive" });
    } finally {
      setResetting(false);
    }
  }

  async function handleEditRole(e: React.FormEvent) {
    e.preventDefault();
    if (!editRoleTarget) return;
    setEditingRole(true);
    try {
      const { error } = await supabase
        .from("user_roles")
        .update({ role: editRoleValue as any })
        .eq("user_id", editRoleTarget.user_id)
        .eq("organization_id", userOrgId!);
      if (error) throw error;
      toast({ title: "Papel atualizado!" });
      setEditRoleTarget(null);
      loadMembers();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    } finally {
      setEditingRole(false);
    }
  }

  const roleLabelForUser = roleLabels[role || ""] || role || "—";

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-extrabold uppercase tracking-wide text-foreground">
        Configurações
      </h1>

      <Tabs defaultValue="minha_conta">
        <TabsList className="mb-6">
          <TabsTrigger value="minha_conta" className="gap-2">
            <User className="h-4 w-4" /> Minha Conta
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="instituicao" className="gap-2">
              <Building2 className="h-4 w-4" /> Instituição
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="acesso" className="gap-2">
              <Users className="h-4 w-4" /> Controle de Acesso
            </TabsTrigger>
          )}
          {isAdmin && (
            <TabsTrigger value="estrutura" className="gap-2">
              <BedDouble className="h-4 w-4" /> Estrutura do Lar
            </TabsTrigger>
          )}
        </TabsList>

        {/* Minha Conta - accessible to ALL roles */}
        <TabsContent value="minha_conta">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold uppercase tracking-wide">Minha Conta</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider">Nome</Label>
                <Input value={user?.user_metadata?.full_name || "—"} disabled className="h-11 rounded-xl bg-muted" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider">Papel no Sistema</Label>
                <Input value={roleLabelForUser} disabled className="h-11 rounded-xl bg-muted" />
              </div>

              <form onSubmit={handleChangeOwnPassword} className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-bold uppercase tracking-wider">Alterar Senha</h3>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Nova Senha</Label>
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required minLength={6} className="h-11 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Confirmar Senha</Label>
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} className="h-11 rounded-xl" />
                </div>
                <Button type="submit" disabled={changingPassword} className="h-11 rounded-xl font-bold uppercase tracking-wider">
                  {changingPassword ? "Alterando..." : "Alterar Senha"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Instituição - admin only */}
        {isAdmin && (
          <TabsContent value="instituicao">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold uppercase tracking-wide">Dados da Instituição</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveOrg} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Tipo</Label>
                    <Input value={org ? orgTypeLabels[org.org_type] || org.org_type : ""} disabled className="h-11 rounded-xl bg-muted" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Nome</Label>
                    <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">CNPJ</Label>
                    <Input value={orgCnpj} onChange={(e) => setOrgCnpj(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Estado (UF)</Label>
                    <Input value={orgState} onChange={(e) => setOrgState(e.target.value)} className="h-11 rounded-xl" maxLength={2} placeholder="Ex: SP" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Cidade</Label>
                    <Input value={orgCity} onChange={(e) => setOrgCity(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Conselho Central</Label>
                    <Input value={orgCentral} onChange={(e) => setOrgCentral(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Conselho Metropolitano</Label>
                    <Input value={orgMetro} onChange={(e) => setOrgMetro(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Telefone WhatsApp do Mural</Label>
                    <Input value={orgWhatsapp} onChange={(e) => setOrgWhatsapp(e.target.value)} className="h-11 rounded-xl" placeholder="Ex: 5511999999999" />
                  </div>
                  <Button type="submit" className="h-11 rounded-xl font-bold uppercase tracking-wider" disabled={saving}>
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {/* Controle de Acesso - admin only */}
        {isAdmin && (
          <TabsContent value="acesso">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-bold uppercase tracking-wide">Usuários da Instituição</CardTitle>
                <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-2 rounded-xl font-bold uppercase text-xs tracking-wider">
                      <UserPlus className="h-4 w-4" /> Convidar
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle className="font-bold uppercase tracking-wide">Convidar Usuário</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleInvite} className="space-y-4">
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider">Nome Completo</Label>
                        <Input value={invName} onChange={(e) => setInvName(e.target.value)} required className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider">E-mail</Label>
                        <Input type="email" value={invEmail} onChange={(e) => setInvEmail(e.target.value)} required className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider">Senha Inicial</Label>
                        <Input type="password" value={invPassword} onChange={(e) => setInvPassword(e.target.value)} required minLength={6} className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider">Cargo</Label>
                        <Input value={invRoleTitle} onChange={(e) => setInvRoleTitle(e.target.value)} placeholder="Ex: Assistente Social" className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-bold uppercase tracking-wider">Papel no Sistema</Label>
                        <Select value={invRole} onValueChange={setInvRole}>
                          <SelectTrigger className="rounded-xl">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Administrador</SelectItem>
                            <SelectItem value="social_worker">Assistente Social</SelectItem>
                            <SelectItem value="psicologo">Psicologia</SelectItem>
                            <SelectItem value="nutricionista">Nutricionista</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full rounded-xl font-bold uppercase tracking-wider" disabled={inviting}>
                        {inviting ? "Convidando..." : "Convidar Usuário"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs font-bold uppercase tracking-wider">Nome</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider">Cargo</TableHead>
                      <TableHead className="text-xs font-bold uppercase tracking-wider">Papel</TableHead>
                      <TableHead className="w-32 text-xs font-bold uppercase tracking-wider">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((m) => (
                      <TableRow key={m.user_id}>
                        <TableCell className="font-medium">{m.full_name || "—"}</TableCell>
                        <TableCell>{m.role_title || "—"}</TableCell>
                        <TableCell>
                          <Badge variant={m.role === "admin" ? "default" : "secondary"}>
                            {roleLabels[m.role] || m.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {m.user_id !== user?.id && (
                              <>
                                <Button variant="ghost" size="icon" title="Editar papel" onClick={() => { setEditRoleTarget(m); setEditRoleValue(m.role); }}>
                                  <Users className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" title="Redefinir senha" onClick={() => { setResetTarget(m); setResetPassword(""); }}>
                                  <KeyRound className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDeleteUser(m.user_id)} className="text-destructive hover:text-destructive">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Reset Password Dialog */}
            <Dialog open={!!resetTarget} onOpenChange={(open) => !open && setResetTarget(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Redefinir Senha — {resetTarget?.full_name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Nova Senha</Label>
                    <Input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} required minLength={6} className="rounded-xl" />
                  </div>
                  <Button type="submit" className="w-full rounded-xl font-bold uppercase tracking-wider" disabled={resetting}>
                    {resetting ? "Redefinindo..." : "Redefinir Senha"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            {/* Edit Role Dialog */}
            <Dialog open={!!editRoleTarget} onOpenChange={(open) => !open && setEditRoleTarget(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Editar Papel — {editRoleTarget?.full_name}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleEditRole} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Papel</Label>
                    <Select value={editRoleValue} onValueChange={setEditRoleValue}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="social_worker">Assistente Social</SelectItem>
                        <SelectItem value="psicologo">Psicologia</SelectItem>
                        <SelectItem value="nutricionista">Nutricionista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full rounded-xl font-bold uppercase tracking-wider" disabled={editingRole}>
                    {editingRole ? "Salvando..." : "Salvar"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>
        )}

        {/* Estrutura do Lar - admin only */}
        {isAdmin && (
          <TabsContent value="estrutura">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-bold uppercase tracking-wide">Estrutura do Lar</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  setSavingStructure(true);
                  try {
                    const { error } = await supabase.from("organizations").update({
                      total_male_beds: maleBeds,
                      total_female_beds: femaleBeds,
                      total_male_rooms: maleRooms,
                      total_female_rooms: femaleRooms,
                    } as any).eq("id", userOrgId!);
                    if (error) throw error;
                    toast({ title: "Estrutura atualizada!" });
                  } catch (err: any) {
                    toast({ title: "Erro", description: err.message, variant: "destructive" });
                  } finally {
                    setSavingStructure(false);
                  }
                }} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider">Vagas Masculinas</Label>
                      <Input type="number" value={maleBeds} onChange={(e) => setMaleBeds(Number(e.target.value))} className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider">Vagas Femininas</Label>
                      <Input type="number" value={femaleBeds} onChange={(e) => setFemaleBeds(Number(e.target.value))} className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider">Quartos Masculinos</Label>
                      <Input type="number" value={maleRooms} onChange={(e) => setMaleRooms(Number(e.target.value))} className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider">Quartos Femininos</Label>
                      <Input type="number" value={femaleRooms} onChange={(e) => setFemaleRooms(Number(e.target.value))} className="h-11 rounded-xl" />
                    </div>
                  </div>
                  <Button type="submit" className="h-11 rounded-xl font-bold uppercase tracking-wider" disabled={savingStructure}>
                    {savingStructure ? "Salvando..." : "Salvar Vagas"}
                  </Button>
                </form>

                <div className="border-t pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold uppercase tracking-wider">Cadastro de Quartos</h3>
                    <Button size="sm" className="gap-2 rounded-xl font-bold uppercase text-xs tracking-wider" onClick={() => {
                      setEditingRoom(null);
                      setRoomForm({ identifier: "", type: "masculino", beds: 1, observations: "" });
                      setRoomOpen(true);
                    }}>
                      <Plus className="h-4 w-4" /> Novo Quarto
                    </Button>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">Identificador</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">Tipo</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">Camas</TableHead>
                        <TableHead className="text-xs font-bold uppercase tracking-wider">Obs</TableHead>
                        <TableHead className="w-24 text-xs font-bold uppercase tracking-wider">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rooms.map((r) => (
                        <TableRow key={r.id}>
                          <TableCell className="font-medium">{r.identifier}</TableCell>
                          <TableCell><Badge variant="secondary">{r.type === "masculino" ? "Masculino" : "Feminino"}</Badge></TableCell>
                          <TableCell>{r.beds}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">{r.observations || "—"}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => {
                                setEditingRoom(r);
                                setRoomForm({ identifier: r.identifier, type: r.type, beds: r.beds, observations: r.observations || "" });
                                setRoomOpen(true);
                              }}><Pencil className="h-4 w-4" /></Button>
                              <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteRoom.mutate(r.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {rooms.length === 0 && (
                        <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">Nenhum quarto cadastrado</TableCell></TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>

            <Dialog open={roomOpen} onOpenChange={setRoomOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="font-bold uppercase tracking-wide">{editingRoom ? "Editar Quarto" : "Novo Quarto"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  try {
                    if (editingRoom) {
                      await updateRoom.mutateAsync({ id: editingRoom.id, ...roomForm });
                    } else {
                      await createRoom.mutateAsync(roomForm);
                    }
                    setRoomOpen(false);
                    toast({ title: editingRoom ? "Quarto atualizado!" : "Quarto criado!" });
                  } catch (err: any) {
                    toast({ title: "Erro", description: err.message, variant: "destructive" });
                  }
                }} className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Identificador *</Label>
                    <Input value={roomForm.identifier} onChange={(e) => setRoomForm({ ...roomForm, identifier: e.target.value })} required className="rounded-xl" placeholder="Ex: Q01" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Tipo</Label>
                    <Select value={roomForm.type} onValueChange={(v) => setRoomForm({ ...roomForm, type: v })}>
                      <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Quantidade de Camas</Label>
                    <Input type="number" value={roomForm.beds} onChange={(e) => setRoomForm({ ...roomForm, beds: Number(e.target.value) })} min={1} className="rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Observações</Label>
                    <Input value={roomForm.observations} onChange={(e) => setRoomForm({ ...roomForm, observations: e.target.value })} className="rounded-xl" />
                  </div>
                  <Button type="submit" className="w-full rounded-xl font-bold uppercase tracking-wider" disabled={createRoom.isPending || updateRoom.isPending}>
                    {editingRoom ? "Salvar" : "Criar Quarto"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
