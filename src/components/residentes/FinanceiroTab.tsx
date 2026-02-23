import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useResidentFinancials, useCreateFinancial, useDeleteFinancial } from "@/hooks/useResidentFinancials";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  residentId: string | null;
}

export function FinanceiroTab({ residentId }: Props) {
  const { data: records = [], isLoading } = useResidentFinancials(residentId);
  const createFinancial = useCreateFinancial();
  const deleteFinancial = useDeleteFinancial();

  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], type: "entrada", description: "", amount: "" });

  if (!residentId) {
    return <p className="text-muted-foreground text-sm py-8 text-center">Salve o residente primeiro para gerenciar o financeiro.</p>;
  }

  const balance = records.reduce((acc, r) => r.type === "entrada" ? acc + Number(r.amount) : acc - Number(r.amount), 0);

  const handleAdd = () => {
    const amount = parseFloat(form.amount);
    if (!form.description || isNaN(amount) || amount <= 0) { toast.error("Preencha todos os campos corretamente"); return; }
    createFinancial.mutate({ ...form, amount, resident_id: residentId }, {
      onSuccess: () => { setForm({ date: new Date().toISOString().split("T")[0], type: "entrada", description: "", amount: "" }); toast.success("Lançamento adicionado"); },
      onError: () => toast.error("Erro ao adicionar lançamento"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-card p-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Saldo Atual</p>
          <p className={`text-2xl font-bold ${balance >= 0 ? "text-green-600" : "text-destructive"}`}>
            R$ {balance.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="entrada">Entrada</SelectItem>
            <SelectItem value="saida">Saída</SelectItem>
          </SelectContent>
        </Select>
        <Input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <Input type="number" step="0.01" placeholder="Valor" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
        <Button onClick={handleAdd} disabled={createFinancial.isPending} className="gap-2">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : records.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground">Nenhum lançamento</TableCell></TableRow>
            ) : (
              records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{format(new Date(r.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>
                    <Badge variant={r.type === "entrada" ? "default" : "destructive"}>
                      {r.type === "entrada" ? "Entrada" : "Saída"}
                    </Badge>
                  </TableCell>
                  <TableCell>{r.description}</TableCell>
                  <TableCell className="text-right font-mono">R$ {Number(r.amount).toFixed(2)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => deleteFinancial.mutate({ id: r.id, residentId: residentId! })}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
