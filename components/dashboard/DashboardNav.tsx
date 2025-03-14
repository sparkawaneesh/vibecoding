'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Home,
  Settings,
  FileText,
  Code,
  Paintbrush,
  Users,
  LayoutDashboard,
} from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: "Code Editor",
    href: "/code-editor",
    icon: <Code className="h-4 w-4" />,
  },
  {
    title: "Design Tool",
    href: "/design-tool",
    icon: <Paintbrush className="h-4 w-4" />,
  },
  {
    title: "Documentation",
    href: "/dashboard/docs",
    icon: <FileText className="h-4 w-4" />,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: <Settings className="h-4 w-4" />,
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="grid items-start gap-2 py-4">
      {navItems.map((item, index) => (
        <Link
          key={index}
          href={item.href}
          className={cn(
            "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
            pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
          )}
        >
          <span className="mr-2 text-muted-foreground group-hover:text-accent-foreground">
            {item.icon}
          </span>
          <span>{item.title}</span>
        </Link>
      ))}
    </nav>
  );
} 