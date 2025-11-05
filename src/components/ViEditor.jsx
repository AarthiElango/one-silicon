import React, { useState, useEffect, useRef } from "react";

export default function ViEditor({ filename, initialContent = "", onClose, theme }) {
  const [content, setContent] = useState(initialContent);
  const [mode, setMode] = useState("normal"); // normal | insert | command
  const [command, setCommand] = useState("");
  const [message, setMessage] = useState(`"${filename}" ${initialContent ? initialContent.split("\n").length + "L" : "[New File]"}`);
  const [cursorPos, setCursorPos] = useState({ line: 0, col: 0 });
  const editorRef = useRef(null);
  const commandInputRef = useRef(null);

  const lines = content.split("\n");

  // Auto-focus handling
  useEffect(() => {
    if (mode === "command") commandInputRef.current?.focus();
  }, [mode]);

  // Main key handler
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (mode === "insert") {
        if (e.key === "Escape") {
          e.preventDefault();
          setMode("normal");
          setMessage("");
        }
        return;
      }

      if (mode === "command") return; // Handled by input

      e.preventDefault();
      const { line, col } = cursorPos;
      let newContent = [...lines];
      let newLine = line;
      let newCol = col;

      switch (e.key) {
        case "i":
          setMode("insert");
          setMessage("-- INSERT --");
          break;
        case "a":
          setMode("insert");
          setMessage("-- INSERT --");
          setCursorPos({ line, col: Math.min(col + 1, (lines[line] || "").length) });
          break;
        case "o":
          newContent.splice(line + 1, 0, "");
          setContent(newContent.join("\n"));
          setCursorPos({ line: line + 1, col: 0 });
          setMode("insert");
          setMessage("-- INSERT --");
          break;
        case "O":
          newContent.splice(line, 0, "");
          setContent(newContent.join("\n"));
          setCursorPos({ line, col: 0 });
          setMode("insert");
          setMessage("-- INSERT --");
          break;
        case "j":
          if (line < lines.length - 1) setCursorPos({ line: line + 1, col: Math.min(col, lines[line + 1].length) });
          break;
        case "k":
          if (line > 0) setCursorPos({ line: line - 1, col: Math.min(col, lines[line - 1].length) });
          break;
        case "h":
          if (col > 0) setCursorPos({ line, col: col - 1 });
          break;
        case "l":
          if (col < (lines[line] || "").length) setCursorPos({ line, col: col + 1 });
          break;
        case "x":
          newContent[line] = (lines[line] || "").slice(0, col) + (lines[line] || "").slice(col + 1);
          setContent(newContent.join("\n"));
          break;
        case "d":
          // Support dd delete line
          setMessage("dd → line deleted");
          newContent.splice(line, 1);
          if (newContent.length === 0) newContent = [""];
          setContent(newContent.join("\n"));
          setCursorPos({ line: Math.min(line, newContent.length - 1), col: 0 });
          break;
        case ":":
          setMode("command");
          setCommand("");
          break;
        case "0":
          setCursorPos({ line, col: 0 });
          break;
        case "$":
          setCursorPos({ line, col: (lines[line] || "").length });
          break;
        case "G":
          setCursorPos({ line: lines.length - 1, col: 0 });
          break;
        case "g":
          setCursorPos({ line: 0, col: 0 });
          break;
        default:
          break;
      }
    };

    const editor = editorRef.current;
    editor.addEventListener("keydown", handleKeyDown);
    return () => editor.removeEventListener("keydown", handleKeyDown);
  }, [mode, cursorPos, content]);

  const handleCommand = (e) => {
    e.preventDefault();
    const cmd = command.trim();

    switch (cmd) {
      case "w":
      case "write":
        setMessage(`"${filename}" ${lines.length}L written`);
        setMode("normal");
        break;
      case "q":
        if (content !== initialContent) {
          setMessage("No write since last change (:q! to quit)");
          setMode("normal");
          return;
        }
        onClose(content, false);
        break;
      case "q!":
        onClose(initialContent, false);
        break;
      case "wq":
      case "x":
        onClose(content, true);
        break;
      case "help":
        setMessage("Use :w to save, :q to quit, :wq to save & quit, :q! to quit without saving");
        break;
      default:
        setMessage(`Not an editor command: ${cmd}`);
    }
    setMode("normal");
  };

  const handleContentChange = (e) => {
    setContent(e.target.innerText);
  };

  return (
    <div
      ref={editorRef}
      tabIndex={0}
      className={`h-full flex flex-col font-mono text-sm focus:outline-none transition-all ${
        theme === "dark" ? "bg-black text-gray-100" : "bg-white text-gray-900"
      }`}
    >
      {/* Main Editing Area */}
      <div
        contentEditable={mode === "insert"}
        suppressContentEditableWarning
        onInput={handleContentChange}
        className={`flex-1 overflow-auto p-3 whitespace-pre outline-none ${
          theme === "dark" ? "caret-white" : "caret-black"
        }`}
        spellCheck={false}
      >
        {lines.map((line, idx) => (
          <div key={idx} className="relative">
            <span>{line || " "}</span>
            {mode === "normal" && cursorPos.line === idx && (
              <span
                className={`absolute ${
                  theme === "dark" ? "bg-gray-100 text-black" : "bg-gray-900 text-white"
                }`}
                style={{
                  left: `${cursorPos.col * 0.6}em`,
                  width: "0.6em",
                  height: "1.1em",
                  top: 0,
                }}
              >
                {line[cursorPos.col] || " "}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Command Line / Status */}
      <div
        className={`flex items-center justify-between px-3 py-1 text-xs border-t ${
          theme === "dark" ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-gray-100 border-gray-300 text-gray-900"
        }`}
      >
        {mode === "command" ? (
          <form onSubmit={handleCommand} className="flex items-center gap-1">
            <span>:</span>
            <input
              ref={commandInputRef}
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              className="bg-transparent outline-none w-64"
              autoFocus
            />
          </form>
        ) : (
          <span>{message || "\u00A0"}</span>
        )}
        <span>
          {cursorPos.line + 1},{cursorPos.col + 1} — {Math.round(((cursorPos.line + 1) / lines.length) * 100)}%
        </span>
      </div>
    </div>
  );
}
