import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
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
import { UserPlus, Trash2, Building2, Users } from "lucide-react";

const orgTypeLabels: Record<string, string> = {
  obra_unida: "Obra Unida (ILPI)",
  conselho_central: "Conselho Central",
  conselho_metropolitano: "Conselho Metropolitano",
  conselho_nacional: "Conselho Nacional",
};

const roleLabels: Record<string, string> = {
  admin: "Administrador",
  coordinator: "Coordenador",
  social_worker: "Assistente Social",
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
  email?: string;
}

export default function Settings() {
  const { user, userOrgId } = useAuth();
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
  const [invRole, setInvRole] = useState("viewer");
  const [invRoleTitle, setInvRoleTitle] = useState("");
  const [invPassword, setInvPassword] = useState("");

  useEffect(() => {
    if (userOrgId) {
      loadOrg();
      loadMembers();
    }
  }, [userOrgId]);

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
      return {
        ...r,
        full_name: prof?.full_name || null,
        role_title: prof?.role_title || null,
      };
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
        body: {
          email: invEmail,
          password: invPassword,
          full_name: invName,
          role: invRole,
          role_title: invRoleTitle,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast({ title: "Usuário convidado com sucesso!" });
      setInviteOpen(false);
      setInvEmail("");
      setInvName("");
      setInvRole("viewer");
      setInvRoleTitle("");
      setInvPassword("");
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
      const { error } = await supabase
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .eq("organization_id", userOrgId!);
      if (error) throw error;
      toast({ title: "Usuário removido da organização" });
      loadMembers();
    } catch (err: any) {
      toast({ title: "Erro", description: err.message, variant: "destructive" });
    }
  }

  const isAdmin = members.some((m) => m.user_id === user?.id && m.role === "admin");

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-6 text-2xl font-extrabold uppercase tracking-wide text-foreground">
        Configurações
      </h1>

      <Tabs defaultValue="instituicao">
        <TabsList className="mb-6">
          <TabsTrigger value="instituicao" className="gap-2">
            <Building2 className="h-4 w-4" /> Instituição
          </TabsTrigger>
          <TabsTrigger value="acesso" className="gap-2">
            <Users className="h-4 w-4" /> Controle de Acesso
          </TabsTrigger>
        </TabsList>

        <TabsContent value="instituicao">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold uppercase tracking-wide">
                Dados da Instituição
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveOrg} className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Tipo</Label>
                  <Input value={org ? orgTypeLabels[org.org_type] || org.org_type : ""} disabled className="h-11 rounded-xl bg-muted" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Nome</Label>
                  <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="h-11 rounded-xl" disabled={!isAdmin} />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">CNPJ</Label>
                  <Input value={orgCnpj} onChange={(e) => setOrgCnpj(e.target.value)} className="h-11 rounded-xl" disabled={!isAdmin} />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Estado (UF)</Label>
                  <Input value={orgState} onChange={(e) => setOrgState(e.target.value)} className="h-11 rounded-xl" disabled={!isAdmin} maxLength={2} placeholder="Ex: SP" />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Cidade</Label>
                  <Input value={orgCity} onChange={(e) => setOrgCity(e.target.value)} className="h-11 rounded-xl" disabled={!isAdmin} />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Conselho Central</Label>
                  <Input value={orgCentral} onChange={(e) => setOrgCentral(e.target.value)} className="h-11 rounded-xl" disabled={!isAdmin} />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Conselho Metropolitano</Label>
                  <Input value={orgMetro} onChange={(e) => setOrgMetro(e.target.value)} className="h-11 rounded-xl" disabled={!isAdmin} />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Telefone WhatsApp do Mural</Label>
                  <Input value={orgWhatsapp} onChange={(e) => setOrgWhatsapp(e.target.value)} className="h-11 rounded-xl" disabled={!isAdmin} placeholder="Ex: 5511999999999" />
                </div>

                {isAdmin && (
                  <Button type="submit" className="h-11 rounded-xl font-bold uppercase tracking-wider" disabled={saving}>
                    {saving ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="acesso">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-bold uppercase tracking-wide">
                Usuários da Instituição
              </CardTitle>
              {isAdmin && (
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
                            <SelectItem value="coordinator">Coordenador</SelectItem>
                            <SelectItem value="social_worker">Assistente Social</SelectItem>
                            <SelectItem value="viewer">Visualizador</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button type="submit" className="w-full rounded-xl font-bold uppercase tracking-wider" disabled={inviting}>
                        {inviting ? "Convidando..." : "Convidar Usuário"}
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs font-bold uppercase tracking-wider">Nome</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider">Cargo</TableHead>
                    <TableHead className="text-xs font-bold uppercase tracking-wider">Papel</TableHead>
                    {isAdmin && <TableHead className="w-12" />}
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
                      {isAdmin && (
                        <TableCell>
                          {m.user_id !== user?.id && (
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteUser(m.user_id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
