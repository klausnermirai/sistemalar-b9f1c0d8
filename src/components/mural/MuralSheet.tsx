import { useState, useRef, useEffect } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useMuralMessages, useMarkMuralRead, useSendMuralMessage, MuralMessage } from "@/hooks/useMural";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { Send, Download, Copy, MessageSquare } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MuralSheet({ open, onOpenChange }: Props) {
  const { user, userOrgId } = useAuth();
  const { profile } = useProfile();
  const { data: messages = [] } = useMuralMessages(userOrgId);
  const markRead = useMarkMuralRead();
  const sendMsg = useSendMuralMessage();
  const [text, setText] = useState("");
  const [exportDate, setExportDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [whatsappPhone, setWhatsappPhone] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open && userOrgId) {
      markRead.mutate(userOrgId);
      // Load whatsapp phone
      supabase.from("organizations").select("mural_whatsapp_phone").eq("id", userOrgId).single()
        .then(({ data }) => { if ((data as any)?.mural_whatsapp_phone) setWhatsappPhone((data as any).mural_whatsapp_phone); });
    }
  }, [open, userOrgId]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const handleSend = () => {
    if (!text.trim() || !userOrgId || !user) return;
    sendMsg.mutate({ organization_id: userOrgId, author_id: user.id, author_name: profile?.full_name || "Usuário", content: text.trim() }, {
      onSuccess: () => { setText(""); markRead.mutate(userOrgId!); },
    });
  };

  const formatMsg = (m: MuralMessage) => `[${format(new Date(m.created_at), "dd/MM/yyyy HH:mm")}] ${m.author_name}: ${m.content}`;

  const exportByDate = () => {
    const dayMsgs = messages.filter((m) => m.created_at.startsWith(exportDate));
    if (dayMsgs.length === 0) { toast.error("Nenhuma mensagem nesta data"); return; }
    return dayMsgs.map(formatMsg).join("\n");
  };

  const copyExport = () => {
    const txt = exportByDate();
    if (txt) { navigator.clipboard.writeText(txt); toast.success("Copiado!"); }
  };

  const whatsappExport = () => {
    const txt = exportByDate();
    if (!txt) return;
    const phone = whatsappPhone.replace(/\D/g, "");
    if (!phone) { toast.error("Configure o telefone WhatsApp em Configurações"); return; }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(txt)}`, "_blank");
  };

  const copyOneMessage = (m: MuralMessage) => {
    navigator.clipboard.writeText(formatMsg(m));
    toast.success("Mensagem copiada!");
  };

  const whatsappOneMessage = (m: MuralMessage) => {
    const phone = whatsappPhone.replace(/\D/g, "");
    if (!phone) { toast.error("Configure o telefone WhatsApp em Configurações"); return; }
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(formatMsg(m))}`, "_blank");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex flex-col w-full sm:max-w-md p-0">
        <SheetHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <SheetTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> Mural</SheetTitle>
            <Popover>
              <PopoverTrigger asChild><Button variant="outline" size="sm" className="gap-1"><Download className="h-4 w-4" /> Exportar</Button></PopoverTrigger>
              <PopoverContent className="w-72 space-y-3" align="end">
                <p className="text-sm font-semibold">Exportar por data</p>
                <Input type="date" value={exportDate} onChange={(e) => setExportDate(e.target.value)} className="rounded-lg" />
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="gap-1 flex-1" onClick={copyExport}><Copy className="h-3 w-3" /> Copiar</Button>
                  <Button size="sm" className="gap-1 flex-1" onClick={whatsappExport}>WhatsApp</Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </SheetHeader>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && <p className="text-center text-muted-foreground py-8">Nenhuma mensagem ainda.</p>}
          {messages.map((m) => {
            const isOwn = m.author_id === user?.id;
            return (
              <div key={m.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 space-y-1 ${isOwn ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  {!isOwn && <p className="text-xs font-semibold">{m.author_name}</p>}
                  <p className="text-sm whitespace-pre-wrap">{m.content}</p>
                  <div className="flex items-center gap-1 justify-end">
                    <span className="text-[10px] opacity-70">{format(new Date(m.created_at), "HH:mm")}</span>
                    <Button variant="ghost" size="icon" className="h-5 w-5 opacity-50 hover:opacity-100" onClick={() => copyOneMessage(m)}><Copy className="h-3 w-3" /></Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input */}
        <div className="border-t p-3 flex gap-2">
          <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Escreva uma mensagem..." className="rounded-full"
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }} />
          <Button size="icon" onClick={handleSend} disabled={sendMsg.isPending || !text.trim()} className="rounded-full shrink-0"><Send className="h-4 w-4" /></Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
