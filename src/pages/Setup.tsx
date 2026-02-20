import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Navigate, useNavigate } from "react-router-dom";
import { Heart, Building2, UserCog, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type OrgType = "obra_unida" | "conselho_central" | "conselho_metropolitano" | "conselho_nacional";

const orgTypeLabels: Record<OrgType, string> = {
  obra_unida: "Obra Unida (ILPI)",
  conselho_central: "Conselho Central",
  conselho_metropolitano: "Conselho Metropolitano",
  conselho_nacional: "Conselho Nacional",
};

export default function Setup() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1 - Org
  const [orgType, setOrgType] = useState<OrgType>("obra_unida");
  const [orgName, setOrgName] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [city, setCity] = useState("");
  const [centralCouncil, setCentralCouncil] = useState("");
  const [metroCouncil, setMetroCouncil] = useState("");

  // Step 2 - Admin
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roleTitle, setRoleTitle] = useState("");

  if (loading) return null;
  if (user) return <Navigate to="/" replace />;

  function formatCnpj(value: string) {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    return digits
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");
  }

  async function handleFinish(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const cleanCnpj = cnpj.replace(/\D/g, "");
      if (cleanCnpj.length !== 14) throw new Error("CNPJ inválido");

      // 1. Sign up user
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: window.location.origin,
        },
      });
      if (signUpError) throw signUpError;

      // 2. Get session (auto-confirm must be on, otherwise user needs to verify)
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;

      if (!token) {
        toast({
          title: "Conta criada!",
          description: "Verifique seu e-mail para confirmar o cadastro. Após confirmar, faça login.",
        });
        navigate("/auth");
        return;
      }

      // 3. Call setup-organization edge function
      const { data, error } = await supabase.functions.invoke("setup-organization", {
        body: {
          org_name: orgName,
          org_type: orgType,
          cnpj: cleanCnpj,
          city,
          central_council_name: centralCouncil,
          metropolitan_council_name: metroCouncil,
          role_title: roleTitle,
        },
      });

      if (error) throw new Error(error.message || "Erro ao configurar instituição");
      if (data?.error) throw new Error(data.error);

      toast({
        title: "Instituição configurada!",
        description: "Sua instituição e conta foram criadas com sucesso.",
      });
      navigate("/triagens");
    } catch (err: any) {
      toast({
        title: "Erro",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const steps = [
    { num: 1, label: "Instituição", icon: Building2 },
    { num: 2, label: "Administrador", icon: UserCog },
  ];

  return (
    <div className="flex min-h-screen bg-primary">
      {/* Sidebar */}
      <aside className="hidden w-80 flex-col justify-between p-8 lg:flex">
        <div>
          <div className="mb-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10">
              <Heart className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold uppercase tracking-wider text-primary-foreground">SSVP</h2>
              <p className="text-xs text-primary-foreground/70">Primeiro Acesso</p>
            </div>
          </div>

          <nav className="space-y-4">
            {steps.map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                  step === s.num
                    ? "bg-white/15 text-primary-foreground"
                    : step > s.num
                    ? "text-primary-foreground/80"
                    : "text-primary-foreground/40"
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                    step > s.num
                      ? "bg-green-500 text-white"
                      : step === s.num
                      ? "bg-primary-foreground text-primary"
                      : "bg-white/10 text-primary-foreground/50"
                  }`}
                >
                  {step > s.num ? <Check className="h-4 w-4" /> : s.num}
                </div>
                <span className="text-sm font-semibold uppercase tracking-wide">{s.label}</span>
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main */}
      <main className="flex flex-1 items-center justify-center p-6">
        <div className="w-full max-w-lg rounded-[32px] bg-card p-10 shadow-2xl">
          {step === 1 && (
            <div>
              <h2 className="mb-1 text-xl font-extrabold uppercase tracking-wide text-foreground">
                Dados da Instituição
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Configure os dados da sua entidade
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Tipo de Entidade</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(Object.entries(orgTypeLabels) as [OrgType, string][]).map(([key, label]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setOrgType(key)}
                        className={`rounded-xl border-2 px-3 py-2.5 text-left text-xs font-semibold transition-colors ${
                          orgType === key
                            ? "border-primary bg-primary/5 text-primary"
                            : "border-border text-muted-foreground hover:border-primary/30"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Nome da Instituição</Label>
                  <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="h-11 rounded-xl" required />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">CNPJ</Label>
                  <Input
                    value={cnpj}
                    onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                    placeholder="00.000.000/0000-00"
                    className="h-11 rounded-xl"
                    required
                  />
                </div>

                {(orgType === "obra_unida" || orgType === "conselho_central") && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wider">Cidade</Label>
                    <Input value={city} onChange={(e) => setCity(e.target.value)} className="h-11 rounded-xl" />
                  </div>
                )}

                {orgType === "obra_unida" && (
                  <>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider">Conselho Central Vinculado</Label>
                      <Input value={centralCouncil} onChange={(e) => setCentralCouncil(e.target.value)} className="h-11 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase tracking-wider">Conselho Metropolitano Vinculado</Label>
                      <Input value={metroCouncil} onChange={(e) => setMetroCouncil(e.target.value)} className="h-11 rounded-xl" />
                    </div>
                  </>
                )}

                <Button
                  type="button"
                  onClick={() => {
                    if (!orgName || !cnpj) {
                      toast({ title: "Preencha os campos obrigatórios", variant: "destructive" });
                      return;
                    }
                    setStep(2);
                  }}
                  className="h-11 w-full rounded-xl text-sm font-bold uppercase tracking-wider"
                >
                  Próximo
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={handleFinish}>
              <h2 className="mb-1 text-xl font-extrabold uppercase tracking-wide text-foreground">
                Administrador
              </h2>
              <p className="mb-6 text-sm text-muted-foreground">
                Dados do primeiro usuário (administrador)
              </p>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Nome Completo</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="h-11 rounded-xl" required />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">E-mail</Label>
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-xl" required />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Senha</Label>
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-xl" required minLength={6} />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider">Cargo / Função</Label>
                  <Input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="Ex: Gestor(a), Assistente Social" className="h-11 rounded-xl" />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStep(1)}
                    className="h-11 flex-1 rounded-xl text-sm font-bold uppercase tracking-wider"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="submit"
                    className="h-11 flex-1 rounded-xl text-sm font-bold uppercase tracking-wider"
                    disabled={submitting}
                  >
                    {submitting ? "Configurando..." : "Finalizar"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
