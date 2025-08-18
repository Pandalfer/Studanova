import { LucideIcon } from "lucide-react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SheetClose } from "@/components/ui/sheet";

interface SidebarButtonProps extends ButtonProps {
  icon?: LucideIcon;
  collapsed?: boolean;
}

export function SidebarButton({
  icon: Icon,
  className,
  children,
  collapsed = false,
  ...props
}: SidebarButtonProps) {
  return (
    <Button
      variant={"ghost"}
      className={cn(
        "gap-2 rounded-[2rem] flex items-center transition-all",
        collapsed ? "justify-center px-0" : "justify-start px-3",
        className,
      )}
      {...props}
    >
      {Icon && <Icon size={20} />}
      {!collapsed && <span>{children}</span>}
    </Button>
  );
}
