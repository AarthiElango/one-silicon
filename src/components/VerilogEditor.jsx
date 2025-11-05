import React, { useState } from 'react';
import { Save, Download, Play, FileCode } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

const initialCode = `// 4-bit Counter Module
module counter(
    input wire clk,
    input wire rst,
    output reg [3:0] count
);
    always @(posedge clk or posedge rst) begin
        if (rst)
            count <= 4'b0000;
        else
            count <= count + 1;
    end
endmodule`;

const initialTestbench = `// Counter Testbench
\`timescale 1ns/1ps

module counter_tb;
    reg clk;
    reg rst;
    wire [3:0] count;
    
    // Instantiate counter
    counter uut (
        .clk(clk),
        .rst(rst),
        .count(count)
    );
    
    // Clock generation
    initial begin
        clk = 0;
        forever #5 clk = ~clk;
    end
    
    // Test stimulus
    initial begin
        $dumpfile("counter.vcd");
        $dumpvars(0, counter_tb);
        
        rst = 1;
        #10 rst = 0;
        
        #100 $finish;
    end
    
    // Monitor
    initial begin
        $monitor("Time=%0t Counter=%b", $time, count);
    end
endmodule`;

export default function VerilogEditor({ theme, onRun }) {
  const [designCode, setDesignCode] = useState(initialCode);
  const [testbenchCode, setTestbenchCode] = useState(initialTestbench);
  const [activeTab, setActiveTab] = useState('design');

  const currentCode = activeTab === 'design' ? designCode : testbenchCode;
  const setCurrentCode = activeTab === 'design' ? setDesignCode : setTestbenchCode;

  const lineCount = currentCode.split('\n').length;
  const lines = Array.from({ length: Math.max(lineCount, 25) }, (_, i) => i + 1);

  const handleSave = () => {
    const filename = activeTab === 'design' ? 'counter.v' : 'counter_tb.v';
    const blob = new Blob([currentCode], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className={`h-full flex flex-col ${
        theme === 'dark' ? 'bg-[#0a0a0a]' : 'bg-white'
      }`}
    >
      {/* Editor Header */}
      <div
        className={`flex items-center justify-between px-4 py-2 border-b ${
          theme === 'dark'
            ? 'bg-[#1a1a1a] border-gray-800'
            : 'bg-gray-50 border-gray-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <FileCode className="w-4 h-4 text-emerald-500" />
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="h-8 bg-transparent">
              <TabsTrigger
                value="design"
                className="text-xs data-[state=active]:bg-transparent data-[state=active]:text-emerald-500"
              >
                counter.v
              </TabsTrigger>
              <TabsTrigger
                value="testbench"
                className="text-xs data-[state=active]:bg-transparent data-[state=active]:text-emerald-500"
              >
                counter_tb.v
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="h-7 text-xs"
          >
            <Save className="w-3 h-3 mr-1" />
            Save
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSave}
            className="h-7 text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
          <Button
            onClick={() => onRun && onRun(designCode)}
            className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
          >
            <Play className="w-3 h-3 mr-1" />
            Compile & Run
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Line Numbers */}
        <div
          className={`w-12 py-3 text-right pr-3 select-none text-xs font-mono border-r ${
            theme === 'dark'
              ? 'bg-[#0f0f0f] text-gray-600 border-gray-800'
              : 'bg-gray-50 text-gray-400 border-gray-200'
          }`}
        >
          {lines.map((line) => (
            <div key={line} className="leading-6 h-6">
              {line}
            </div>
          ))}
        </div>

        {/* Code Editor */}
        <div className="flex-1 relative overflow-auto">
          <textarea
            value={currentCode}
            onChange={(e) => setCurrentCode(e.target.value)}
            className={`w-full h-full p-3 font-mono text-sm resize-none focus:outline-none leading-6 ${
              theme === 'dark'
                ? 'bg-[#0a0a0a] text-gray-200'
                : 'bg-white text-gray-900'
            }`}
            style={{
              tabSize: 4,
              minHeight: '100%',
              fontFamily:
                '"Fira Code", Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
              lineHeight: '24px',
            }}
            spellCheck={false}
          />
        </div>
      </div>

      {/* Status Bar */}
      <div
        className={`flex items-center justify-between px-4 py-1 text-xs border-t ${
          theme === 'dark'
            ? 'bg-[#0f0f0f] border-gray-800 text-gray-500'
            : 'bg-gray-50 border-gray-200 text-gray-600'
        }`}
      >
        <div className="flex items-center gap-4">
          <span>
            Ln {currentCode.split('\n').length}, Col {currentCode.length}
          </span>
          <span>Verilog</span>
          <span>UTF-8</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Spaces: 4</span>
          <span className="text-emerald-500">● Saved</span>
        </div>
      </div>
    </div>
  );
}
