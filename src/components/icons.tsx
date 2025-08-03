
import { cn } from "@/lib/utils";

export const Logo = ({ className }: { className?: string }) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn(className)}>
        <path d="M4 4H8V8H4V4Z" fill="hsl(var(--primary))"/>
        <path d="M4 10H8V14H4V10Z" fill="hsl(var(--primary))"/>
        <path d="M4 16H8V20H4V16Z" fill="hsl(var(--primary))"/>
        <path d="M10 4H14V8H10V4Z" fill="hsl(var(--primary))" fillOpacity="0.6"/>
        <path d="M10 10H14V14H10V10Z" fill="hsl(var(--primary))" fillOpacity="0.6"/>
        <path d="M16 4H20V8H16V4Z" fill="hsl(var(--primary))" fillOpacity="0.3"/>
    </svg>
)
