"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronDownIcon, RotateCcwIcon, TypeIcon, FolderIcon, FolderClosedIcon } from "lucide-react";
import Image from "next/image";

const SUPPORTED_LANGUAGES = {
  javascript: {
    label: "JavaScript",
    logoPath: "/javascript.png",
  },
  python: {
    label: "Python",
    logoPath: "/python.png",
  },
  typescript: {
    label: "TypeScript",
    logoPath: "/typescript.png",
  },
};

const THEMES = [
  { id: "vs-dark", label: "Dark" },
  { id: "vs-light", label: "Light" },
  { id: "github-dark", label: "GitHub Dark" },
];

interface EditorToolbarProps {
  onRefresh: () => void;
  onToggleExplorer: () => void;
}

export default function EditorToolbar({ onRefresh, onToggleExplorer }: EditorToolbarProps) {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);

  const { language, theme, fontSize, setLanguage, setTheme, setFontSize } = useCodeEditorStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangOpen(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFontSizeChange = (newSize: number) => {
    const size = Math.min(Math.max(newSize, 12), 24);
    setFontSize(size);
  };

  return (
    <div className="flex items-center gap-3">
      {/* File Explorer Toggle */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onToggleExplorer}
        className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors"
        aria-label="Toggle file explorer"
      >
        <FolderIcon className="w-4 h-4 text-gray-400" />
      </motion.button>
      
      {/* Language Selector */}
      <div ref={langDropdownRef} className="relative">
        <button
          onClick={() => setIsLangOpen(!isLangOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5 hover:bg-[#2a2a3a] transition-colors"
        >
          <Image
            src={SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES]?.logoPath || "/code.png"}
            alt="Language logo"
            width={16}
            height={16}
          />
          <span className="text-sm font-medium text-gray-300">
            {SUPPORTED_LANGUAGES[language as keyof typeof SUPPORTED_LANGUAGES]?.label || "Unknown"}
          </span>
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        </button>

        {isLangOpen && (
          <div className="absolute top-full mt-2 w-48 py-2 bg-[#1e1e2e] rounded-lg shadow-lg ring-1 ring-white/5 z-10">
            {Object.entries(SUPPORTED_LANGUAGES).map(([id, { label, logoPath }]) => (
              <button
                key={id}
                onClick={() => {
                  setLanguage(id);
                  setIsLangOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a3a] transition-colors"
              >
                <Image src={logoPath} alt={label} width={16} height={16} />
                {label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Theme Selector */}
      <div ref={themeDropdownRef} className="relative">
        <button
          onClick={() => setIsThemeOpen(!isThemeOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5 hover:bg-[#2a2a3a] transition-colors"
        >
          <span className="text-sm font-medium text-gray-300">
            {THEMES.find((t) => t.id === theme)?.label || "Theme"}
          </span>
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        </button>

        {isThemeOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 py-2 bg-[#1e1e2e] rounded-lg shadow-lg ring-1 ring-white/5 z-10">
            {THEMES.map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                  setIsThemeOpen(false);
                }}
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-300 hover:bg-[#2a2a3a] transition-colors"
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Font Size Control */}
      <div className="flex items-center gap-3 px-3 py-2 bg-[#1e1e2e] rounded-lg ring-1 ring-white/5">
        <TypeIcon className="w-4 h-4 text-gray-400" />
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="12"
            max="24"
            value={fontSize}
            onChange={(e) => handleFontSizeChange(parseInt(e.target.value))}
            className="w-20 h-1 bg-gray-600 rounded-lg cursor-pointer"
          />
          <span className="text-sm font-medium text-gray-400 min-w-[2rem] text-center">
            {fontSize}
          </span>
        </div>
      </div>

      {/* Refresh Button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onRefresh}
        className="p-2 bg-[#1e1e2e] hover:bg-[#2a2a3a] rounded-lg ring-1 ring-white/5 transition-colors"
        aria-label="Reset to default code"
      >
        <RotateCcwIcon className="w-4 h-4 text-gray-400" />
      </motion.button>
    </div>
  );
} 