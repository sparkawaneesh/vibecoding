'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Code, Palette, ArrowRight, LogIn, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useAuth } from '@clerk/nextjs';
import { Logo } from '@/components/ui/logo';

export default function Home() {
  const router = useRouter();
  const { isSignedIn } = useAuth();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <main className="min-h-screen bg-[#0f0f17] text-white">
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <Logo size="lg" variant="minimal" />
        <div className="flex gap-4">
          {isSignedIn ? (
            <Button 
              onClick={() => router.push('/dashboard')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/auth/sign-in')}
                className="text-gray-300 hover:text-white"
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button 
                onClick={() => router.push('/auth/sign-up')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Sign Up
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <motion.div 
          className="flex flex-col items-center justify-center gap-8 text-center"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.div variants={item} className="relative w-24 h-24">
            <div className="absolute inset-0 bg-blue-500 rounded-full opacity-20 blur-xl animate-pulse"></div>
            <div className="relative flex items-center justify-center w-full h-full bg-[#1e1e2e] rounded-full border border-white/10">
              <span className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">VS</span>
            </div>
          </motion.div>
          
          <motion.h1 variants={item} className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Vibe Studio
          </motion.h1>
          
          <motion.p variants={item} className="text-xl text-gray-400 max-w-2xl">
            Your all-in-one creative workspace for coding and design
          </motion.p>
          
          <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full max-w-2xl">
            <motion.div 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-blue-600 to-blue-800 p-[1px] rounded-xl"
            >
              <div className="bg-[#1e1e2e] rounded-xl p-6 h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Code className="w-6 h-6 text-blue-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Code Editor</h2>
                </div>
                <p className="text-gray-400 mb-6">
                  A powerful code editor with syntax highlighting, debugging, and AI assistance.
                </p>
                <Button 
                  onClick={() => isSignedIn ? router.push('/code-editor') : router.push('/auth/sign-in')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isSignedIn ? 'Open Editor' : 'Sign In to Use'} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
            
            <motion.div 
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-purple-600 to-purple-800 p-[1px] rounded-xl"
            >
              <div className="bg-[#1e1e2e] rounded-xl p-6 h-full">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Palette className="w-6 h-6 text-purple-400" />
                  </div>
                  <h2 className="text-xl font-semibold">Design Tool</h2>
                </div>
                <p className="text-gray-400 mb-6">
                  Create beautiful designs with our intuitive canvas and collaborative tools.
                </p>
                <Button 
                  onClick={() => isSignedIn ? router.push('/design-tool') : router.push('/auth/sign-in')}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                >
                  {isSignedIn ? 'Open Designer' : 'Sign In to Use'} <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div 
            variants={item} 
            className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl"
          >
            {[
              { title: "Modern Editor", description: "Powered by Monaco Editor with VSCode-like features" },
              { title: "AI Assistance", description: "Get help with coding, debugging, and optimization" },
              { title: "Collaboration", description: "Share your work and collaborate in real-time" }
            ].map((feature, index) => (
              <div key={index} className="bg-[#1e1e2e] rounded-xl p-6 border border-white/5">
                <h3 className="text-lg font-medium mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.description}</p>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </main>
  );
} 