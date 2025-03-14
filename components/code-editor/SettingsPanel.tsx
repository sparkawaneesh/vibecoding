"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useState } from "react";
import { Settings, X, Check, RotateCcw } from "lucide-react";
import { motion } from "framer-motion";

interface SettingsGroup {
  id: string;
  title: string;
  settings: Setting[];
}

interface Setting {
  id: string;
  title: string;
  description?: string;
  type: "select" | "checkbox" | "range" | "radio";
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue: any;
}

const EDITOR_SETTINGS: SettingsGroup[] = [
  {
    id: "appearance",
    title: "Appearance",
    settings: [
      {
        id: "theme",
        title: "Theme",
        description: "Choose your preferred editor theme",
        type: "select",
        options: [
          { value: "vs-dark", label: "Dark" },
          { value: "vs-light", label: "Light" },
          { value: "github-dark", label: "GitHub Dark" },
          { value: "monokai", label: "Monokai" },
          { value: "dracula", label: "Dracula" },
        ],
        defaultValue: "vs-dark",
      },
      {
        id: "fontSize",
        title: "Font Size",
        description: "Adjust the editor font size",
        type: "range",
        min: 12,
        max: 24,
        step: 1,
        defaultValue: 16,
      },
      {
        id: "fontFamily",
        title: "Font Family",
        description: "Choose your preferred font family",
        type: "select",
        options: [
          { value: "Fira Code", label: "Fira Code" },
          { value: "Cascadia Code", label: "Cascadia Code" },
          { value: "JetBrains Mono", label: "JetBrains Mono" },
          { value: "Consolas", label: "Consolas" },
          { value: "Menlo", label: "Menlo" },
        ],
        defaultValue: "Fira Code",
      },
    ],
  },
  {
    id: "editor",
    title: "Editor",
    settings: [
      {
        id: "minimap",
        title: "Minimap",
        description: "Show a minimap of the code on the right side",
        type: "checkbox",
        defaultValue: false,
      },
      {
        id: "wordWrap",
        title: "Word Wrap",
        description: "Wrap long lines to fit in the editor",
        type: "checkbox",
        defaultValue: true,
      },
      {
        id: "lineNumbers",
        title: "Line Numbers",
        description: "Show line numbers in the editor",
        type: "select",
        options: [
          { value: "on", label: "On" },
          { value: "off", label: "Off" },
          { value: "relative", label: "Relative" },
        ],
        defaultValue: "on",
      },
      {
        id: "tabSize",
        title: "Tab Size",
        description: "Number of spaces for each tab",
        type: "select",
        options: [
          { value: "2", label: "2 spaces" },
          { value: "4", label: "4 spaces" },
          { value: "8", label: "8 spaces" },
        ],
        defaultValue: "2",
      },
    ],
  },
  {
    id: "features",
    title: "Features",
    settings: [
      {
        id: "autoSave",
        title: "Auto Save",
        description: "Automatically save changes",
        type: "checkbox",
        defaultValue: true,
      },
      {
        id: "formatOnSave",
        title: "Format on Save",
        description: "Format code when saving",
        type: "checkbox",
        defaultValue: true,
      },
      {
        id: "linting",
        title: "Linting",
        description: "Enable code linting",
        type: "checkbox",
        defaultValue: true,
      },
      {
        id: "autoComplete",
        title: "Auto Complete",
        description: "Enable code auto-completion",
        type: "checkbox",
        defaultValue: true,
      },
    ],
  },
];

export default function SettingsPanel() {
  const { 
    theme, 
    setTheme, 
    fontSize, 
    setFontSize,
    setEditorOptions
  } = useCodeEditorStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(() => {
    // Initialize settings with current values from store
    const initialSettings: Record<string, any> = {};
    
    EDITOR_SETTINGS.forEach(group => {
      group.settings.forEach(setting => {
        if (setting.id === "theme") {
          initialSettings[setting.id] = theme;
        } else if (setting.id === "fontSize") {
          initialSettings[setting.id] = fontSize;
        } else {
          initialSettings[setting.id] = setting.defaultValue;
        }
      });
    });
    
    return initialSettings;
  });

  const handleSettingChange = (id: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [id]: value
    }));
    
    // Update store based on setting
    if (id === "theme") {
      setTheme(value);
    } else if (id === "fontSize") {
      setFontSize(Number(value));
    } else {
      // For other settings, update editor options
      const editorOptionUpdates: Record<string, any> = {};
      
      switch (id) {
        case "minimap":
          editorOptionUpdates.minimap = { enabled: value };
          break;
        case "wordWrap":
          editorOptionUpdates.wordWrap = value ? "on" : "off";
          break;
        case "lineNumbers":
          editorOptionUpdates.lineNumbers = value;
          break;
        case "tabSize":
          editorOptionUpdates.tabSize = Number(value);
          break;
        case "fontFamily":
          editorOptionUpdates.fontFamily = value;
          break;
        // Add more cases as needed
      }
      
      if (Object.keys(editorOptionUpdates).length > 0) {
        setEditorOptions(editorOptionUpdates);
      }
    }
  };

  const resetSettings = () => {
    const defaultSettings: Record<string, any> = {};
    
    EDITOR_SETTINGS.forEach(group => {
      group.settings.forEach(setting => {
        defaultSettings[setting.id] = setting.defaultValue;
        
        // Update store with default values
        if (setting.id === "theme") {
          setTheme(setting.defaultValue);
        } else if (setting.id === "fontSize") {
          setFontSize(Number(setting.defaultValue));
        }
      });
    });
    
    setSettings(defaultSettings);
    
    // Update editor options with defaults
    setEditorOptions({
      minimap: { enabled: defaultSettings.minimap },
      wordWrap: defaultSettings.wordWrap ? "on" : "off",
      lineNumbers: defaultSettings.lineNumbers,
      tabSize: Number(defaultSettings.tabSize),
      fontFamily: defaultSettings.fontFamily,
    });
  };

  const renderSetting = (setting: Setting) => {
    const value = settings[setting.id];
    
    switch (setting.type) {
      case "select":
        return (
          <select
            id={setting.id}
            value={value}
            onChange={(e) => handleSettingChange(setting.id, e.target.value)}
            className="w-full p-2 bg-[#252535] rounded-md text-sm text-gray-300 border border-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {setting.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case "checkbox":
        return (
          <div className="flex items-center h-6">
            <input
              id={setting.id}
              type="checkbox"
              checked={value}
              onChange={(e) => handleSettingChange(setting.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-[#252535] border-gray-700 rounded focus:ring-blue-500 focus:ring-offset-gray-800"
            />
          </div>
        );
        
      case "range":
        return (
          <div className="flex items-center gap-3">
            <input
              id={setting.id}
              type="range"
              min={setting.min}
              max={setting.max}
              step={setting.step}
              value={value}
              onChange={(e) => handleSettingChange(setting.id, e.target.value)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-gray-400 min-w-[2rem] text-center">
              {value}
            </span>
          </div>
        );
        
      case "radio":
        return (
          <div className="space-y-2">
            {setting.options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  id={`${setting.id}-${option.value}`}
                  type="radio"
                  name={setting.id}
                  value={option.value}
                  checked={value === option.value}
                  onChange={() => handleSettingChange(setting.id, option.value)}
                  className="w-4 h-4 text-blue-600 bg-[#252535] border-gray-700 focus:ring-blue-500 focus:ring-offset-gray-800"
                />
                <label
                  htmlFor={`${setting.id}-${option.value}`}
                  className="ml-2 text-sm text-gray-300"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#1e1e2e] text-gray-300 hover:bg-[#2a2a3a] border border-white/10"
      >
        <Settings className="w-4 h-4" />
        <span className="text-sm">Settings</span>
      </motion.button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-2xl bg-[#1e1e2e] rounded-xl shadow-lg border border-white/10 p-4 max-h-[80vh] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-gray-400" />
            Editor Settings
          </h3>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-md hover:bg-[#3a3a4a] text-gray-300"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-6">
            {EDITOR_SETTINGS.map((group) => (
              <div key={group.id} className="space-y-4">
                <h4 className="text-md font-medium text-gray-300 border-b border-gray-700 pb-2">
                  {group.title}
                </h4>
                
                <div className="space-y-4">
                  {group.settings.map((setting) => (
                    <div key={setting.id} className="grid grid-cols-2 gap-4 items-start">
                      <div>
                        <label htmlFor={setting.id} className="text-sm font-medium text-gray-300">
                          {setting.title}
                        </label>
                        {setting.description && (
                          <p className="text-xs text-gray-500 mt-1">{setting.description}</p>
                        )}
                      </div>
                      <div>{renderSetting(setting)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="flex justify-between mt-4 pt-4 border-t border-gray-700">
          <button
            onClick={resetSettings}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-[#252535] text-gray-300 hover:bg-[#3a3a4a]"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset to Defaults</span>
          </button>
          
          <button
            onClick={() => setIsOpen(false)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            <Check className="w-4 h-4" />
            <span>Done</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
} 