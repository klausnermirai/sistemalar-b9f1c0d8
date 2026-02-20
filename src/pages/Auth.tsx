import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Navigate, Link } from "react-router-dom";
import { Heart, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [cnpj, setCnpj] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const cleanCnpj = cnpj.replace(/\D/g, "");
      if (cleanCnpj.length !== 14) {
        throw new Error("CNPJ inválido. Informe os 14 dígitos.");
      }

      // 1. Sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;

      // 2. Check CNPJ matches user's org
      const { data: session } = await supabase.auth.getSession();
      const userId = session.session?.user?.id;
      if (!userId) throw new Error("Erro ao obter sessão");

      const { data: orgId } = await supabase.rpc("get_user_organization_id", { _user_id: userId });
      if (!orgId) {
        await supabase.auth.signOut();
        throw new Error("Usuário não vinculado a nenhuma instituição. Contacte o administrador.");
      }

      const { data: org } = await supabase
        .from("organizations")
        .select("cnpj")
        .eq("id", orgId)
        .single();

      if (!org || org.cnpj !== cleanCnpj) {
        await supabase.auth.signOut();
        throw new Error("CNPJ não corresponde à instituição vinculada ao seu cadastro.");
      }
    } catch (err: any) {
      toast({
        title: "Erro no login",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-primary p-4">
      <div className="w-full max-w-md rounded-[40px] bg-card p-10 shadow-2xl">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-primary">
            <Heart className="h-10 w-10 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-extrabold uppercase tracking-wider text-primary">
            SSVP
          </h1>
          <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Gestão ILPI
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="cnpj" className="text-xs font-bold uppercase tracking-wider text-foreground">
              CNPJ da Instituição
            </Label>
            <Input
              id="cnpj"
              value={cnpj}
              onChange={(e) => setCnpj(formatCnpj(e.target.value))}
              placeholder="00.000.000/0000-00"
              required
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-foreground">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="h-12 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-wider text-foreground">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="h-12 rounded-xl pr-12"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            className="h-12 w-full rounded-xl text-sm font-bold uppercase tracking-wider"
            disabled={submitting}
          >
            {submitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            to="/setup"
            className="text-sm font-semibold text-primary hover:underline"
          >
            Primeiro acesso? Configure sua instituição
          </Link>
        </div>
      </div>
    </div>
  );
}
