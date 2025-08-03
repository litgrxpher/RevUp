
"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ClipboardList, Dumbbell } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "./auth-provider"

const navItems = [
  { href: "/", label: "Workout", icon: Dumbbell },
  { href: "/templates", label: "Templates", icon: ClipboardList },
]

export default function BottomNav() {
  const pathname = usePathname()
  const { user, loading } = useAuth();

  if (loading || !user) {
    return null; // Don't render nav on auth pages or while loading
  }

  const isAuthPage = pathname === '/login' || pathname === '/signup';
  if(isAuthPage) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border/20 bg-background/80 backdrop-blur-sm md:hidden">
      <div className="mx-auto grid h-full max-w-lg grid-cols-2 font-medium">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group inline-flex flex-col items-center justify-center px-5 text-muted-foreground transition-colors hover:text-primary",
                isActive && "text-primary"
              )}
            >
              <item.icon className={cn("mb-1 h-6 w-6")} />
              <span className="text-xs">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
