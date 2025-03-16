import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Heart, ListTodo, GamepadIcon, Gift, ListChecks, HeartHandshake, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function Sidebar() {
  const [location] = useLocation();
  const { logoutMutation } = useAuth();

  const routes = [
    { href: "/", label: "Dashboard", icon: Heart },
    { href: "/tasks", label: "Tasks", icon: ListTodo },
    { href: "/game", label: "Truth or Dare", icon: GamepadIcon },
    { href: "/coupons", label: "Love Coupons", icon: Gift },
    { href: "/bucket-list", label: "Bucket List", icon: ListChecks },
    { href: "/why-hot", label: "Why I Find You Hot", icon: HeartHandshake },
  ];

  return (
    <div className="flex h-screen bg-sidebar border-r">
      <div className="flex flex-col w-64">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-primary" />
            <span className="font-semibold">RelationTrack</span>
          </Link>
        </div>
        <ScrollArea className="flex-1 px-3">
          <nav className="flex flex-col gap-2">
            {routes.map((route) => {
              const Icon = route.icon;
              return (
                <Link key={route.href} href={route.href}>
                  <Button
                    variant={location === route.href ? "secondary" : "ghost"}
                    className={cn("w-full justify-start gap-2")}
                  >
                    <Icon className="h-4 w-4" />
                    {route.label}
                  </Button>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>
    </div>
  );
}
