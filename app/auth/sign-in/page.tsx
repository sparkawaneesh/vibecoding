'use client';

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function SignInPage() {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === "dark";

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="absolute top-4 left-4">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
      
      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Welcome back</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Sign in to your Vibe Studio account
          </p>
        </div>
        
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <SignIn 
            appearance={{
              baseTheme: isDarkMode ? dark : undefined,
              elements: {
                formButtonPrimary: 
                  "bg-blue-600 hover:bg-blue-700 text-white",
                footerActionLink: 
                  "text-blue-600 hover:text-blue-700",
              }
            }}
            redirectUrl="/dashboard"
          />
        </div>
      </div>
    </div>
  );
} 