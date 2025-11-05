import React, { useState } from 'react';
import { Sun, Moon, Terminal as TerminalIcon, FileCode, Activity } from 'lucide-react';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from './ui/resizable';
import Sidebar from './Sidebar';
import Terminal from './Terminal';
import VerilogEditor from './VerilogEditor';
import WaveformViewer from './WaveformViewer';

function TerminalApp()  {
  const [theme, setTheme] = useState('dark');
  const [activeMainTab, setActiveMainTab] = useState('terminal');

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleRunCode = (code) => {
    // Switch to terminal tab to show compilation
    setActiveMainTab('terminal');
  };

  return (
    <div className={`h-screen flex flex-col ${
      theme === 'dark' ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'
    }`}>
      {/* Top Navigation */}
      <div className={`flex items-center justify-between px-4 h-12 border-b ${
        theme === 'dark' ? 'bg-[#1a1a1a] border-gray-800' : 'bg-gray-50 border-gray-200'
      }`}>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            <span className="text-sm text-gray-400">HDL Studio</span>
            <span className="text-sm">Ubuntu Verilog Environment</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="h-8 px-3"
          >
            {theme === 'dark' ? (
              <><Sun className="w-4 h-4 mr-1" /> Light</>
            ) : (
              <><Moon className="w-4 h-4 mr-1" /> Dark</>
            )}
          </Button>

          <Button variant="ghost" size="sm" className="h-8 px-3">
            Save Workspace
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar theme={theme} />

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ResizablePanelGroup direction="vertical">
            {/* Top Panel - Code Editor */}
            <ResizablePanel defaultSize={60} minSize={30}>
              <VerilogEditor theme={theme} onRun={handleRunCode} />
            </ResizablePanel>

            <ResizableHandle className={theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'} />

            {/* Bottom Panel - Terminal/Waveform/Schematic Tabs */}
            <ResizablePanel defaultSize={40} minSize={20}>
              <Tabs 
                value={activeMainTab} 
                onValueChange={setActiveMainTab} 
                className={`h-full border-t ${
                  theme === 'dark' ? 'border-gray-800 bg-[#0a0a0a]' : 'border-gray-200 bg-white'
                }`}
              >
                <div className={`flex items-center px-4 border-b ${
                  theme === 'dark' ? 'border-gray-800' : 'border-gray-200'
                }`}>
                  <TabsList className="bg-transparent h-10">
                    <TabsTrigger 
                      value="terminal" 
                      className="data-[state=active]:bg-transparent data-[state=active]:text-emerald-500"
                    >
                      <TerminalIcon className="w-4 h-4 mr-2" />
                      Terminal
                    </TabsTrigger>
                    <TabsTrigger 
                      value="waveform" 
                      className="data-[state=active]:bg-transparent data-[state=active]:text-emerald-500"
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Waveform (GTKWave)
                    </TabsTrigger>
                    <TabsTrigger 
                      value="schematic" 
                      className="data-[state=active]:bg-transparent data-[state=active]:text-emerald-500"
                    >
                      <FileCode className="w-4 h-4 mr-2" />
                      Schematic
                    </TabsTrigger>
                  </TabsList>
                </div>

                <TabsContent value="terminal" className="flex-1 m-0 h-[calc(100%-41px)]">
                  <Terminal theme={theme} />
                </TabsContent>

                <TabsContent value="waveform" className="flex-1 m-0 h-[calc(100%-41px)]">
                  <WaveformViewer theme={theme} />
                </TabsContent>

                <TabsContent value="schematic" className="flex-1 m-0 h-[calc(100%-41px)] p-4">
                  <div className={`h-full flex items-center justify-center rounded-lg border-2 border-dashed ${
                    theme === 'dark' ? 'border-gray-700' : 'border-gray-300'
                  }`}>
                    <div className="text-center">
                      <FileCode className={`w-12 h-12 mx-auto mb-3 ${
                        theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                      }`} />
                      <p className={`text-sm ${
                        theme === 'dark' ? 'text-gray-500' : 'text-gray-600'
                      }`}>
                        RTL Schematic viewer
                      </p>
                      <p className={`text-xs mt-1 ${
                        theme === 'dark' ? 'text-gray-600' : 'text-gray-500'
                      }`}>
                        Compile your design to view the schematic
                      </p>
                      <Button variant="outline" size="sm" className="mt-4">
                        Generate Schematic
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className={`flex items-center justify-between px-4 py-1 text-xs border-t ${
        theme === 'dark' ? 'bg-[#0f0f0f] border-gray-800 text-gray-500' : 'bg-gray-50 border-gray-200 text-gray-600'
      }`}>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
            Workspace: ~/hdl-workspace
          </span>
          <span>Icarus Verilog 11.0</span>
          <span>GTKWave 3.3.104</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Ubuntu 22.04 LTS</span>
          <span>Ready</span>
        </div>
      </div>
    </div>
  );
}

export default TerminalApp;

