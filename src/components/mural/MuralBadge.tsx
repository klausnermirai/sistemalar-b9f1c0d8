import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useMuralUnreadCount } from "@/hooks/useMural";
import { useAuth } from "@/hooks/useAuth";
import { MuralSheet } from "./MuralSheet";

export function MuralBadge() {
  const { userOrgId } = useAuth();
  const { data: unread = 0 } = useMuralUnreadCount(userOrgId);
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="ghost" size="icon" className="relative" onClick={() => setOpen(true)}>
        <MessageSquare className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </Button>
      <MuralSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
