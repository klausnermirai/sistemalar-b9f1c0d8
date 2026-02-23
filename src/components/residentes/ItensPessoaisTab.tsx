import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { useResidentItems, useCreateItem, useDeleteItem } from "@/hooks/useResidentItems";
import { toast } from "sonner";
import { format } from "date-fns";

interface Props {
  residentId: string | null;
}

export function ItensPessoaisTab({ residentId }: Props) {
  const { data: items = [], isLoading } = useResidentItems(residentId);
  const createItem = useCreateItem();
  const deleteItem = useDeleteItem();

  const [form, setForm] = useState({ description: "", status: "Entrada", date: new Date().toISOString().split("T")[0], observation: "" });

  if (!residentId) {
    return <p className="text-muted-foreground text-sm py-8 text-center">Salve o residente primeiro para gerenciar itens pessoais.</p>;
  }

  const handleAdd = () => {
    if (!form.description) { toast.error("Informe a descrição do item"); return; }
    createItem.mutate({ ...form, resident_id: residentId }, {
      onSuccess: () => { setForm({ description: "", status: "Entrada", date: new Date().toISOString().split("T")[0], observation: "" }); toast.success("Item adicionado"); },
      onError: () => toast.error("Erro ao adicionar item"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        <Input placeholder="Descrição do item" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="md:col-span-2" />
        <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Entrada">Entrada</SelectItem>
            <SelectItem value="Saída">Saída</SelectItem>
          </SelectContent>
        </Select>
        <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
        <Button onClick={handleAdd} disabled={createItem.isPending} className="gap-2">
          <Plus className="h-4 w-4" /> Adicionar
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Movimento</TableHead>
              <TableHead>Observação</TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground">Carregando...</TableCell></TableRow>
            ) : items.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-4 text-muted-foreground">Nenhum item cadastrado</TableCell></TableRow>
            ) : (
              items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{format(new Date(item.date), "dd/MM/yyyy")}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell>
                    <Badge variant={item.status === "Entrada" ? "default" : "secondary"}>
                      {item.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.observation || "—"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => deleteItem.mutate({ id: item.id, residentId: residentId! })}>
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
