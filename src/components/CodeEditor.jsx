import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/ttabs';
import { Button } from './ui/button';
import { Copy, Download, Maximize2 } from 'lucide-react';

export default function CodeEditor({ code, onChange, theme, language }) {
  const [activeEditorTab, setActiveEditorTab] = useState('editor');
  
  const lineCount = code.split('\n').length;
  const lines = Array.from({ length: Math.max(lineCount, 20) }, (_, i) => i + 1);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch (err) {
      // Fallback for environments where clipboard API is restricted
      const textArea = document.createElement('textarea');
      textArea.value = code;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
      } catch (e) {
        console.log('Copy failed');
      }
      document.body.removeChild(textArea);
    }
  };

  const highlightVerilog = (text) => {
    const keywords = ['module', 'endmodule', 'input', 'output', 'wire', 'reg', 'assign', 'always', 'begin', 'end', 'if', 'else'];
    let highlighted = text;

    keywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'g');
      highlighted = highlighted.replace(regex, `<span class="text-purple-400">${keyword}</span>`);
    });

    // Comments
    highlighted = highlighted.replace(/(\/\/.*)/g, '<span class="text-green-500">$1</span>');
    
    return highlighted;
  };

  return (
    <div className={`flex-1 flex flex-col border-b ${
      theme === 'dark' ? 'bg-[#0a0a0a] border-gray-800' : 'bg-white border-gray-200'
    }`}>
      
      {/* Editor Tabs */}
      <div className={`flex items-center justify-between px-4 border-b ${
        theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
      }`}>
        <Tabs value={activeEditorTab} onValueChange={setActiveEditorTab}>
          <TabsList className="bg-transparent h-10">
            <TabsTrigger 
              value="editor" 
              className="data-[state=active]:bg-transparent data-[state=active]:text-emerald-500"
            >
              Program Editor
            </TabsTrigger>
            <TabsTrigger 
              value="testbench" 
              className="data-[state=active]:bg-transparent data-[state=active]:text-emerald-500"
            >
              Testbench
            </TabsTrigger>
            <TabsTrigger 
              value="solution" 
              className="data-[state=active]:bg-transparent data-[state=active]:text-emerald-500"
            >
              Solution
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            onClick={handleCopy}
          >
            <Copy className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Maximize2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div className={`w-12 py-4 text-right pr-3 select-none text-sm font-mono ${
          theme === 'dark' ? 'bg-[#0f0f0f] text-gray-600' : 'bg-gray-50 text-gray-400'
        }`}>
          {lines.map((line) => (
            <div key={line} className="leading-6">
              {line}
            </div>
          ))}
        </div>

        {/* Editor */}
        <div className="flex-1 relative">
          <textarea
            value={code}
            onChange={(e) => onChange(e.target.value)}
            className={`w-full h-full p-4 font-mono text-sm resize-none focus:outline-none leading-6 ${
              theme === 'dark' 
                ? 'bg-[#0a0a0a] text-gray-200' 
                : 'bg-white text-gray-900'
            }`}
            style={{
              tabSize: 2,
              fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, source-code-pro, monospace'
            }}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div className={`flex items-center justify-between px-4 py-1 text-xs border-t ${
        theme === 'dark' ? 'bg-[#0f0f0f] border-gray-800 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-600'
      }`}>
        <div className="flex items-center gap-4">
          <span>Ln {code.split('\n').length}, Col {code.length}</span>
          <span>{language}</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Spaces: 2</span>
          <span className="text-emerald-500">● Ready</span>
        </div>
      </div>
    </div>
  );
}
