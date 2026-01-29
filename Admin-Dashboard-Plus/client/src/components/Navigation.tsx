import { Link, useLocation } from "wouter";
import { Users, Gamepad2, ClipboardList, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";

export function Navigation() {
  const [location] = useLocation();

  const navItems = [
    { href: "/members", icon: Users, label: "Members" },
    { href: "/games", icon: Gamepad2, label: "Games" },
    { href: "/track", icon: ClipboardList, label: "Track" },
    { href: "/calendar", icon: CalendarDays, label: "Calendar" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 pb-4 shadow-lg z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 cursor-pointer w-16",
                  isActive
                    ? "text-primary bg-primary/10 -translate-y-2 shadow-sm"
                    : "text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                )}
              >
                <item.icon
                  className={cn(
                    "w-6 h-6 transition-all duration-300",
                    isActive ? "scale-110" : "scale-100"
                  )}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className="text-[10px] font-bold tracking-wide">
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
