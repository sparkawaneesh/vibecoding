export const LANGUAGE_CONFIG: Record<string, { label: string; monacoLanguage: string; logoPath: string }> = {
  javascript: {
    label: "JavaScript",
    monacoLanguage: "javascript",
    logoPath: "/javascript.png"
  },
  typescript: {
    label: "TypeScript",
    monacoLanguage: "typescript",
    logoPath: "/typescript.png"
  },
  python: {
    label: "Python",
    monacoLanguage: "python",
    logoPath: "/python.png"
  },
  java: {
    label: "Java",
    monacoLanguage: "java",
    logoPath: "/java.png"
  },
  csharp: {
    label: "C#",
    monacoLanguage: "csharp",
    logoPath: "/csharp.png"
  },
  cpp: {
    label: "C++",
    monacoLanguage: "cpp",
    logoPath: "/cpp.png"
  },
  go: {
    label: "Go",
    monacoLanguage: "go",
    logoPath: "/go.png"
  },
  rust: {
    label: "Rust",
    monacoLanguage: "rust",
    logoPath: "/rust.png"
  },
  php: {
    label: "PHP",
    monacoLanguage: "php",
    logoPath: "/php.png"
  },
  ruby: {
    label: "Ruby",
    monacoLanguage: "ruby",
    logoPath: "/ruby.png"
  },
  swift: {
    label: "Swift",
    monacoLanguage: "swift",
    logoPath: "/swift.png"
  },
  kotlin: {
    label: "Kotlin",
    monacoLanguage: "kotlin",
    logoPath: "/kotlin.png"
  },
  html: {
    label: "HTML",
    monacoLanguage: "html",
    logoPath: "/html.png"
  },
  css: {
    label: "CSS",
    monacoLanguage: "css",
    logoPath: "/css.png"
  },
  sql: {
    label: "SQL",
    monacoLanguage: "sql",
    logoPath: "/sql.png"
  }
};

export const defineMonacoThemes = (monaco: any) => {
  monaco.editor.defineTheme('vs-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#121218',
      'editor.foreground': '#d4d4d4',
      'editorCursor.foreground': '#d4d4d4',
      'editor.lineHighlightBackground': '#1e1e2e',
      'editorLineNumber.foreground': '#555555',
      'editorLineNumber.activeForeground': '#cccccc',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#3a3d41'
    }
  });
}; 