"use client";

import Editor from "@/components/code-editor/Editor";
import { motion } from "framer-motion";

export default function CodeEditorPage() {
  return (
    <main className="min-h-screen bg-[#0f0f17]">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Editor />
      </motion.div>
    </main>
  );
} 