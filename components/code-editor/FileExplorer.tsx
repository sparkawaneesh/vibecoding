"use client";

import { useCodeEditorStore } from "@/store/useCodeEditorStore";
import { useState } from "react";
import { 
  FolderIcon, 
  FileIcon, 
  ChevronRightIcon, 
  ChevronDownIcon, 
  PlusIcon, 
  MoreHorizontalIcon,
  Trash2Icon,
  FileEditIcon,
  FolderPlusIcon
} from "lucide-react";
import { motion } from "framer-motion";

interface FileSystemItem {
  id: string;
  name: string;
  type: "file" | "folder";
  extension?: string;
  content?: string;
  children?: FileSystemItem[];
}

// Sample file system structure
const SAMPLE_FILE_SYSTEM: FileSystemItem[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [
      {
        id: "components",
        name: "components",
        type: "folder",
        children: [
          {
            id: "button.js",
            name: "button.js",
            type: "file",
            extension: "js",
            content: "export default function Button({ children }) {\n  return <button>{children}</button>;\n}"
          },
          {
            id: "input.js",
            name: "input.js",
            type: "file",
            extension: "js",
            content: "export default function Input({ value, onChange }) {\n  return <input value={value} onChange={onChange} />;\n}"
          }
        ]
      },
      {
        id: "app.js",
        name: "app.js",
        type: "file",
        extension: "js",
        content: "import Button from './components/button';\nimport Input from './components/input';\n\nexport default function App() {\n  return (\n    <div>\n      <Input value=\"\" onChange={() => {}} />\n      <Button>Click me</Button>\n    </div>\n  );\n}"
      }
    ]
  },
  {
    id: "package.json",
    name: "package.json",
    type: "file",
    extension: "json",
    content: "{\n  \"name\": \"my-app\",\n  \"version\": \"1.0.0\",\n  \"dependencies\": {\n    \"react\": \"^18.0.0\",\n    \"react-dom\": \"^18.0.0\"\n  }\n}"
  }
];

export default function FileExplorer() {
  const { openFile, currentFile } = useCodeEditorStore();
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>(SAMPLE_FILE_SYSTEM);
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    src: true,
    components: true
  });
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    item: FileSystemItem;
  } | null>(null);
  const [newItemParent, setNewItemParent] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState("");
  const [newItemType, setNewItemType] = useState<"file" | "folder">("file");

  const toggleFolder = (id: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleFileClick = (file: FileSystemItem) => {
    if (file.type === "file") {
      openFile(file.id, file.name, file.content || "", file.extension || "");
    }
  };

  const handleContextMenu = (e: React.MouseEvent, item: FileSystemItem) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      item
    });
  };

  const closeContextMenu = () => {
    setContextMenu(null);
  };

  const handleNewItem = (parentId: string, type: "file" | "folder") => {
    setNewItemParent(parentId);
    setNewItemType(type);
    setNewItemName("");
    closeContextMenu();
  };

  const createNewItem = () => {
    if (!newItemName.trim() || !newItemParent) {
      setNewItemParent(null);
      return;
    }

    const newItem: FileSystemItem = {
      id: `${newItemParent}/${newItemName}${newItemType === "file" ? getExtensionFromName(newItemName) : ""}`,
      name: newItemName,
      type: newItemType,
      extension: newItemType === "file" ? getExtensionFromName(newItemName) : undefined,
      content: newItemType === "file" ? "" : undefined,
      children: newItemType === "folder" ? [] : undefined
    };

    // Update file system (in a real app, this would be more complex)
    const updatedFileSystem = [...fileSystem];
    addItemToFileSystem(updatedFileSystem, newItemParent, newItem);
    
    setFileSystem(updatedFileSystem);
    setNewItemParent(null);
    
    // Expand the parent folder
    setExpandedFolders(prev => ({
      ...prev,
      [newItemParent]: true
    }));
  };

  const addItemToFileSystem = (items: FileSystemItem[], parentId: string, newItem: FileSystemItem) => {
    for (const item of items) {
      if (item.id === parentId && item.type === "folder") {
        item.children = [...(item.children || []), newItem];
        return true;
      }
      
      if (item.children && addItemToFileSystem(item.children, parentId, newItem)) {
        return true;
      }
    }
    
    return false;
  };

  const getExtensionFromName = (name: string) => {
    const parts = name.split(".");
    return parts.length > 1 ? `.${parts[parts.length - 1]}` : "";
  };

  const renderFileSystem = (items: FileSystemItem[], level = 0) => {
    return items.map(item => {
      const isExpanded = expandedFolders[item.id];
      const isCurrentFile = currentFile?.id === item.id;
      
      return (
        <div key={item.id}>
          <div 
            className={`flex items-center py-1 px-2 rounded-md ${isCurrentFile ? "bg-blue-500/20 text-blue-400" : "hover:bg-[#2a2a3a]"}`}
            style={{ paddingLeft: `${level * 12 + 8}px` }}
            onClick={() => item.type === "folder" ? toggleFolder(item.id) : handleFileClick(item)}
            onContextMenu={(e) => handleContextMenu(e, item)}
          >
            {item.type === "folder" ? (
              <>
                <button 
                  className="mr-1 text-gray-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFolder(item.id);
                  }}
                >
                  {isExpanded ? <ChevronDownIcon className="w-4 h-4" /> : <ChevronRightIcon className="w-4 h-4" />}
                </button>
                <FolderIcon className="w-4 h-4 mr-2 text-yellow-400" />
              </>
            ) : (
              <>
                <span className="w-5" />
                <FileIcon className="w-4 h-4 mr-2 text-blue-400" />
              </>
            )}
            <span className="text-sm truncate">{item.name}</span>
          </div>
          
          {item.type === "folder" && isExpanded && item.children && (
            <div>
              {renderFileSystem(item.children, level + 1)}
              
              {newItemParent === item.id && (
                <div 
                  className="flex items-center py-1 px-2"
                  style={{ paddingLeft: `${(level + 1) * 12 + 8}px` }}
                >
                  <span className="w-5" />
                  {newItemType === "folder" ? (
                    <FolderIcon className="w-4 h-4 mr-2 text-yellow-400" />
                  ) : (
                    <FileIcon className="w-4 h-4 mr-2 text-blue-400" />
                  )}
                  <input
                    type="text"
                    value={newItemName}
                    onChange={(e) => setNewItemName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") createNewItem();
                      if (e.key === "Escape") setNewItemParent(null);
                    }}
                    placeholder={`New ${newItemType}...`}
                    autoFocus
                    className="bg-transparent text-sm outline-none border-b border-gray-600 text-gray-300 w-full"
                  />
                </div>
              )}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="bg-[#1e1e2e] rounded-xl border border-white/[0.05] p-3 h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-white">Explorer</h3>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => handleNewItem("src", "file")}
            className="p-1 rounded-md hover:bg-[#2a2a3a] text-gray-400"
            title="New File"
          >
            <FileEditIcon className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleNewItem("src", "folder")}
            className="p-1 rounded-md hover:bg-[#2a2a3a] text-gray-400"
            title="New Folder"
          >
            <FolderPlusIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
        {renderFileSystem(fileSystem)}
      </div>
      
      {contextMenu && (
        <div 
          className="fixed bg-[#252535] rounded-lg shadow-lg border border-white/10 py-1 z-50"
          style={{ 
            left: `${contextMenu.x}px`, 
            top: `${contextMenu.y}px` 
          }}
        >
          {contextMenu.item.type === "folder" && (
            <>
              <button 
                onClick={() => handleNewItem(contextMenu.item.id, "file")}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-300 hover:bg-[#2a2a3a]"
              >
                <FileEditIcon className="w-4 h-4" />
                New File
              </button>
              <button 
                onClick={() => handleNewItem(contextMenu.item.id, "folder")}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-gray-300 hover:bg-[#2a2a3a]"
              >
                <FolderPlusIcon className="w-4 h-4" />
                New Folder
              </button>
              <div className="border-t border-gray-700 my-1" />
            </>
          )}
          <button 
            className="flex items-center gap-2 w-full px-3 py-1.5 text-sm text-red-400 hover:bg-[#2a2a3a]"
          >
            <Trash2Icon className="w-4 h-4" />
            Delete
          </button>
        </div>
      )}
      
      {contextMenu && (
        <div 
          className="fixed inset-0 z-40"
          onClick={closeContextMenu}
        />
      )}
    </div>
  );
} 