import { useState, useEffect, useMemo } from "react";
import { useNutritionAssessment, useUpsertNutritionAssessment, NutritionAssessment as NAType } from "@/hooks/useNutritionAssessments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const CHRONIC_DISEASES_OPTIONS = ["Diabetes", "Hipertensão", "Dislipidemia", "Doença Renal", "DPOC", "Insuficiência Cardíaca", "Doença Hepática", "Câncer"];
const ORAL_HEALTH_OPTIONS = ["Prótese total", "Prótese parcial", "Ausência de dentes", "Engasgos frequentes", "Disfagia"];

interface Props {
  residentId: string;
}

export function NutritionAssessment({ residentId }: Props) {
  const { data: existing, isLoading } = useNutritionAssessment(residentId);
  const upsert = useUpsertNutritionAssessment();

  const [form, setForm] = useState<Partial<NAType>>({
    date: new Date().toISOString().split("T")[0],
    weight_kg: null, height_m: null, imc: null,
    circ_arm: null, circ_waist: null, circ_abdomen: null, circ_hip: null, circ_thigh: null, circ_calf: null,
    measurements_not_possible: false,
    chronic_diseases: [], feeding_route: null, recommended_consistency: null, oral_health: [],
    food_preferences: null, aversions_restrictions: null, severe_allergies: null,
    sex: null, age: null, activity_level: null, tmb: null, get: null,
    skinfold_tricipital: null, skinfold_bicipital: null, skinfold_subscapular: null, skinfold_suprailiac: null,
    body_fat_percentage: null,
    screening_score: null, screening_classification: null, screening_observations: null,
    nutritional_diagnosis: null, needs_supplementation: false, supplementation_details: null, pia_nutritional_goals: null,
  });

  useEffect(() => {
    if (existing) setForm(existing);
  }, [existing]);

  // Auto-calc IMC
  const imc = useMemo(() => {
    if (form.weight_kg && form.height_m && form.height_m > 0) return +(form.weight_kg / (form.height_m ** 2)).toFixed(1);
    return null;
  }, [form.weight_kg, form.height_m]);

  // Auto-calc TMB & GET
  const tmb = useMemo(() => {
    if (!form.weight_kg || !form.height_m || !form.age || !form.sex) return null;
    const h = form.height_m * 100;
    if (form.sex === "M") return +(66.5 + 13.75 * form.weight_kg + 5.003 * h - 6.755 * form.age).toFixed(0);
    return +(655.1 + 9.563 * form.weight_kg + 1.85 * h - 4.676 * form.age).toFixed(0);
  }, [form.weight_kg, form.height_m, form.age, form.sex]);

  const activityFactors: Record<string, number> = { sedentario: 1.2, leve: 1.375, moderado: 1.55, intenso: 1.725 };
  const get_ = useMemo(() => {
    if (!tmb || !form.activity_level) return null;
    return +(tmb * (activityFactors[form.activity_level] || 1.2)).toFixed(0);
  }, [tmb, form.activity_level]);

  // Body fat estimate (simplified Durnin-Womersley)
  const bodyFat = useMemo(() => {
    const folds = [form.skinfold_tricipital, form.skinfold_bicipital, form.skinfold_subscapular, form.skinfold_suprailiac].filter((v) => v != null) as number[];
    if (folds.length < 2 || !form.age || !form.sex) return null;
    const sumFolds = folds.reduce((a, b) => a + b, 0);
    const logSum = Math.log10(sumFolds);
    let density: number;
    if (form.sex === "M") {
      density = 1.1631 - 0.0632 * logSum;
    } else {
      density = 1.1599 - 0.0717 * logSum;
    }
    return +((4.95 / density - 4.5) * 100).toFixed(1);
  }, [form.skinfold_tricipital, form.skinfold_bicipital, form.skinfold_subscapular, form.skinfold_suprailiac, form.age, form.sex]);

  const setNum = (field: keyof NAType, val: string) => {
    setForm((p) => ({ ...p, [field]: val === "" ? null : parseFloat(val) }));
  };

  const toggleArr = (field: "chronic_diseases" | "oral_health", val: string) => {
    setForm((p) => {
      const arr = (p[field] as string[]) || [];
      return { ...p, [field]: arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val] };
    });
  };

  const handleSave = async () => {
    try {
      await upsert.mutateAsync({
        ...form,
        resident_id: residentId,
        imc, tmb, get: get_, body_fat_percentage: bodyFat,
      } as any);
      toast.success("Avaliação nutricional salva");
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  if (isLoading) return <div className="p-4 text-muted-foreground text-sm">Carregando...</div>;

  return (
    <div className="space-y-6">
      {/* A) Dados Antropométricos */}
      <Card>
        <CardHeader><CardTitle className="text-base">A) Dados Antropométricos e Clínicos</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Peso (kg)</Label>
              <Input type="number" step="0.1" value={form.weight_kg ?? ""} onChange={(e) => setNum("weight_kg", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Altura (m)</Label>
              <Input type="number" step="0.01" value={form.height_m ?? ""} onChange={(e) => setNum("height_m", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>IMC (calculado)</Label>
              <div className="flex items-center gap-2 h-10">
                <span className="text-lg font-bold">{imc ?? "—"}</span>
                {imc && (
                  <Badge variant={imc < 18.5 ? "destructive" : imc < 25 ? "secondary" : imc < 30 ? "outline" : "destructive"}>
                    {imc < 18.5 ? "Baixo peso" : imc < 25 ? "Eutrófico" : imc < 30 ? "Sobrepeso" : "Obesidade"}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={form.measurements_not_possible} onCheckedChange={(c) => setForm({ ...form, measurements_not_possible: !!c })} />
            <Label className="text-sm">Medidas não realizadas por limitação funcional do residente</Label>
          </div>

          {!form.measurements_not_possible && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                ["circ_arm", "Braço (cm)"], ["circ_waist", "Cintura (cm)"], ["circ_abdomen", "Abdômen (cm)"],
                ["circ_hip", "Quadril (cm)"], ["circ_thigh", "Coxa (cm)"], ["circ_calf", "Panturrilha (cm)"],
              ].map(([key, label]) => (
                <div key={key} className="space-y-2">
                  <Label>{label}</Label>
                  <Input type="number" step="0.1" value={(form as any)[key] ?? ""} onChange={(e) => setNum(key as any, e.target.value)} />
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            <Label>Doenças Crônicas de Impacto Nutricional</Label>
            <div className="flex flex-wrap gap-3">
              {CHRONIC_DISEASES_OPTIONS.map((o) => (
                <label key={o} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={(form.chronic_diseases || []).includes(o)} onCheckedChange={() => toggleArr("chronic_diseases", o)} />
                  {o}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* B) Via e perfil de alimentação */}
      <Card>
        <CardHeader><CardTitle className="text-base">B) Via e Perfil de Alimentação</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Via de Alimentação</Label>
              <Select value={form.feeding_route || ""} onValueChange={(v) => setForm({ ...form, feeding_route: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="oral">Oral</SelectItem>
                  <SelectItem value="sne">SNE (Sonda Nasoentérica)</SelectItem>
                  <SelectItem value="gtt">GTT (Gastrostomia)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Consistência Recomendada</Label>
              <Select value={form.recommended_consistency || ""} onValueChange={(v) => setForm({ ...form, recommended_consistency: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="normal">Normal/Livre</SelectItem>
                  <SelectItem value="branda">Branda</SelectItem>
                  <SelectItem value="pastosa">Pastosa</SelectItem>
                  <SelectItem value="liquida_pastosa">Líquida-pastosa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Saúde Oral e Deglutição</Label>
            <div className="flex flex-wrap gap-3">
              {ORAL_HEALTH_OPTIONS.map((o) => (
                <label key={o} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={(form.oral_health || []).includes(o)} onCheckedChange={() => toggleArr("oral_health", o)} />
                  {o}
                </label>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* C) Preferências e necessidades */}
      <Card>
        <CardHeader><CardTitle className="text-base">C) Preferências e Necessidades</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Gostos Alimentares</Label>
            <Textarea value={form.food_preferences || ""} onChange={(e) => setForm({ ...form, food_preferences: e.target.value })} placeholder="Alimentos preferidos..." />
          </div>
          <div className="space-y-2">
            <Label>Aversões e Restrições/Intolerâncias</Label>
            <Textarea value={form.aversions_restrictions || ""} onChange={(e) => setForm({ ...form, aversions_restrictions: e.target.value })} placeholder="Alimentos que rejeita ou não tolera..." />
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label>Alergias Graves</Label>
              {form.severe_allergies && <AlertTriangle className="h-4 w-4 text-destructive" />}
            </div>
            <Textarea
              value={form.severe_allergies || ""}
              onChange={(e) => setForm({ ...form, severe_allergies: e.target.value })}
              placeholder="Alergias alimentares graves..."
              className={form.severe_allergies ? "border-destructive bg-destructive/5" : ""}
            />
          </div>
        </CardContent>
      </Card>

      {/* D) Cálculo Metabólico */}
      <Card>
        <CardHeader><CardTitle className="text-base">D) Cálculo Metabólico</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Sexo</Label>
              <Select value={form.sex || ""} onValueChange={(v) => setForm({ ...form, sex: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="M">Masculino</SelectItem>
                  <SelectItem value="F">Feminino</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Idade</Label>
              <Input type="number" value={form.age ?? ""} onChange={(e) => setNum("age", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Nível de Atividade</Label>
              <Select value={form.activity_level || ""} onValueChange={(v) => setForm({ ...form, activity_level: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentario">Sedentário</SelectItem>
                  <SelectItem value="leve">Leve</SelectItem>
                  <SelectItem value="moderado">Moderado</SelectItem>
                  <SelectItem value="intenso">Intenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-md bg-muted/50">
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">TMB (kcal/dia)</p>
              <p className="text-xl font-bold">{tmb ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">GET (kcal/dia)</p>
              <p className="text-xl font-bold">{get_ ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase font-semibold">Sugestões Calóricas</p>
              {get_ ? (
                <div className="text-sm space-y-0.5">
                  <p>Manutenção: <strong>{get_}</strong> kcal</p>
                  <p>Perda: <strong>{get_ - 500}</strong> kcal</p>
                  <p>Ganho: <strong>{get_ + 500}</strong> kcal</p>
                </div>
              ) : <p className="text-sm text-muted-foreground">—</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* E) Triagem Nutricional */}
      <Card>
        <CardHeader><CardTitle className="text-base">E) Triagem Nutricional (MNA Simplificado)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Pontuação</Label>
              <Input type="number" value={form.screening_score ?? ""} onChange={(e) => setNum("screening_score", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Classificação</Label>
              <Select value={form.screening_classification || ""} onValueChange={(v) => setForm({ ...form, screening_classification: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sem_risco">Sem risco (≥12)</SelectItem>
                  <SelectItem value="risco">Risco (8-11)</SelectItem>
                  <SelectItem value="alto_risco">Alto risco (&lt;8)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center h-full pt-6">
              {form.screening_classification && (
                <Badge variant={form.screening_classification === "sem_risco" ? "secondary" : form.screening_classification === "risco" ? "outline" : "destructive"}>
                  {form.screening_classification === "sem_risco" ? "Sem risco" : form.screening_classification === "risco" ? "Risco nutricional" : "Alto risco nutricional"}
                </Badge>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Observações da Triagem</Label>
            <Textarea value={form.screening_observations || ""} onChange={(e) => setForm({ ...form, screening_observations: e.target.value })} placeholder="Observações..." />
          </div>
        </CardContent>
      </Card>

      {/* F) Composição Corporal */}
      <Card>
        <CardHeader><CardTitle className="text-base">F) Composição Corporal (Opcional)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              ["skinfold_tricipital", "Tricipital (mm)"], ["skinfold_bicipital", "Bicipital (mm)"],
              ["skinfold_subscapular", "Subescapular (mm)"], ["skinfold_suprailiac", "Supra-ilíaca (mm)"],
            ].map(([key, label]) => (
              <div key={key} className="space-y-2">
                <Label>{label}</Label>
                <Input type="number" step="0.1" value={(form as any)[key] ?? ""} onChange={(e) => setNum(key as any, e.target.value)} />
              </div>
            ))}
          </div>
          <div className="p-4 rounded-md bg-muted/50">
            <p className="text-xs text-muted-foreground uppercase font-semibold">% Gordura Corporal Estimada</p>
            <p className="text-xl font-bold">{bodyFat != null ? `${bodyFat}%` : "Dados insuficientes"}</p>
          </div>
        </CardContent>
      </Card>

      {/* G) Conclusão PIA */}
      <Card>
        <CardHeader><CardTitle className="text-base">G) Conclusão para o PIA</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Diagnóstico Nutricional Inicial</Label>
            <Textarea value={form.nutritional_diagnosis || ""} onChange={(e) => setForm({ ...form, nutritional_diagnosis: e.target.value })} placeholder="Conclusão do diagnóstico nutricional..." />
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch checked={form.needs_supplementation} onCheckedChange={(c) => setForm({ ...form, needs_supplementation: c })} />
              <Label>Necessita suplementação?</Label>
            </div>
          </div>
          {form.needs_supplementation && (
            <div className="space-y-2">
              <Label>Qual suplementação?</Label>
              <Input value={form.supplementation_details || ""} onChange={(e) => setForm({ ...form, supplementation_details: e.target.value })} placeholder="Tipo e detalhes da suplementação..." />
            </div>
          )}
          <div className="space-y-2">
            <Label>Metas Nutricionais para o PIA</Label>
            <Textarea value={form.pia_nutritional_goals || ""} onChange={(e) => setForm({ ...form, pia_nutritional_goals: e.target.value })} placeholder="Metas nutricionais..." />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={upsert.isPending}>
          <Save className="h-4 w-4 mr-1" /> {upsert.isPending ? "Salvando..." : "Salvar Avaliação"}
        </Button>
      </div>
    </div>
  );
}
