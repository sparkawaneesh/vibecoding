'use client';

import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardShell } from "@/components/dashboard/DashboardShell";

export default function ProfilePage() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <DashboardShell>
      <DashboardHeader
        heading="Profile"
        text="Manage your account settings and profile information."
      />
      <div className="grid gap-10">
        <UserProfile
          appearance={{
            baseTheme: isDarkMode ? dark : undefined,
            elements: {
              formButtonPrimary: 
                "bg-blue-600 hover:bg-blue-700 text-white",
              card: "shadow-none",
            },
          }}
        />
      </div>
    </DashboardShell>
  );
} 