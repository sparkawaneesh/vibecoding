import { ReactNode } from "react";
import { DashboardNav } from "./DashboardNav";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { Logo } from "@/components/ui/logo";

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-4">
            <Logo size="md" variant="default" />
          </div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] lg:grid-cols-[240px_1fr]">
        <aside className="hidden w-[200px] flex-col md:flex lg:w-[240px]">
          <DashboardNav />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
} 