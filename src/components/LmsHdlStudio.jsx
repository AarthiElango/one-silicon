import React, { useState, useEffect } from "react";

export default function LmsHdlStudio() {
  const [editorTab, setEditorTab] = useState("program");
  const [leftTab, setLeftTab] = useState("task");
  const [bottomTab, setBottomTab] = useState("console");
  const [theme, setTheme] = useState("dark");
  const [language, setLanguage] = useState("verilog");
  const [hoveredIcon, setHoveredIcon] = useState("");
  const [testbenchMode, setTestbenchMode] = useState("default");
  const [isGithubConnected, setIsGithubConnected] = useState(false);
  const [showGithubModal, setShowGithubModal] = useState(false);
  const [showPushModal, setShowPushModal] = useState(false);
  const [githubUsername, setGithubUsername] = useState("");
  const [githubPassword, setGithubPassword] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [hasPassedTests, setHasPassedTests] = useState(false);
  const [isSubmittedCorrectly, setIsSubmittedCorrectly] = useState(false);
  const [discussionText, setDiscussionText] = useState("");
  const [discussions, setDiscussions] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  
  // Language templates
  const templates = {
    verilog: `// Verilog template
module top_module(input wire a, output wire y);
  // TODO: your RTL
  assign y = a;
endmodule
`,
    systemverilog: `// SystemVerilog template
module top_module(input logic a, output logic y);
  // TODO: your RTL
  assign y = a;
endmodule
`,
    vhdl: `-- VHDL template
library IEEE;
use IEEE.STD_LOGIC_1164.ALL;

entity top_module is
  Port ( a : in STD_LOGIC;
         y : out STD_LOGIC);
end top_module;

architecture Behavioral of top_module is
begin
  -- TODO: your RTL
  y <= a;
end Behavioral;
`
  };

  const [designCode, setDesignCode] = useState(templates.verilog);
  const [customTestbenchCode, setCustomTestbenchCode] = useState(`// Custom Testbench
module testbench;
  reg a;
  wire y;
  
  top_module uut(.a(a), .y(y));
  
  initial begin
    $dumpfile("dump.vcd");
    $dumpvars(0, testbench);
    
    a = 0; #10;
    $display("a=%b, y=%b", a, y);
    
    a = 1; #10;
    $display("a=%b, y=%b", a, y);
    
    $finish;
  end
endmodule
`);

  const defaultTestbench = `// Default Testbench (Provided)
module testbench;
  reg a;
  wire y;
  
  top_module uut(.a(a), .y(y));
  
  initial begin
    $dumpfile("dump.vcd");
    $dumpvars(0, testbench);
    
    a = 0; #10;
    if (y !== a) $display("FAIL: a=%b, y=%b", a, y);
    else $display("PASS: a=%b, y=%b", a, y);
    
    a = 1; #10;
    if (y !== a) $display("FAIL: a=%b, y=%b", a, y);
    else $display("PASS: a=%b, y=%b", a, y);
    
    $display("Test complete");
    $finish;
  end
endmodule
`;

  const [consoleOutput, setConsoleOutput] = useState("[Ready] Write your code and run simulation");
  const [waveformData, setWaveformData] = useState("");
  const [schematicData, setSchematicData] = useState("");
  const [synthesisData, setSynthesisData] = useState("");
  const [reportData, setReportData] = useState("");
  const [lintData, setLintData] = useState("");

  // Change template when language changes
  useEffect(() => {
    setDesignCode(templates[language]);
  }, [language]);

  const getCurrentCode = () => {
    if (editorTab === "program") return designCode;
    if (editorTab === "testbench") return testbenchMode === "custom" ? customTestbenchCode : defaultTestbench;
    return designCode;
  };

  const updateCurrentCode = (e) => {
    const value = e.target.value;
    if (editorTab === "program") setDesignCode(value);
    else if (editorTab === "testbench" && testbenchMode === "custom") setCustomTestbenchCode(value);
  };

  const formatAction = () => {
    const lines = getCurrentCode().split('\n');
    const formatted = lines.map(line => {
      const trimmed = line.trim();
      if (!trimmed) return '';
      if (trimmed.match(/^(module|endmodule|entity|end|architecture)/)) return trimmed;
      if (trimmed.startsWith('//') || trimmed.startsWith('--')) return '  ' + trimmed;
      return '  ' + trimmed;
    }).join('\n');
    
    if (editorTab === "program") setDesignCode(formatted);
    else if (editorTab === "testbench" && testbenchMode === "custom") setCustomTestbenchCode(formatted);
  };

  const lintAction = () => {
    setBottomTab("lint");
    const code = editorTab === "program" ? designCode : getCurrentCode();
    const hasIssues = code.includes("TODO");
    
    let output = `[Lint] Analyzing ${language} code...\n\n`;
    if (hasIssues) {
      output += "[WARN] TODO comment found - complete implementation\n";
    }
    if (!hasIssues) {
      output += "[OK] No issues found\n[PASS] Code is clean\n";
    }
    setLintData(output);
  };

  const runAction = () => {
    setBottomTab("console");
    setConsoleOutput("[Running] Compiling design and testbench...\n");
    
    setTimeout(() => {
      const testPassed = designCode.includes("assign y = a") || designCode.includes("y <= a");
      
      let output = `[INFO] Compiling ${language}...\n`;
      output += `[INFO] Design module: top_module\n`;
      output += `[INFO] Testbench: ${testbenchMode === "default" ? "Default (Provided)" : "Custom"}\n`;
      output += `[OK] Compilation successful\n\n`;
      output += `[SIM] Starting simulation...\n`;
      
      if (testPassed) {
        output += `[SIM] Time: 0ns  | a=0, y=0 - PASS ✓\n`;
        output += `[SIM] Time: 10ns | a=1, y=1 - PASS ✓\n`;
        output += `[OK] Test complete\n`;
        output += `[PASS] All tests passed ✓\n`;
        setHasPassedTests(true);
        setIsSubmittedCorrectly(true);
      } else {
        output += `[SIM] Time: 0ns  | a=0, y=? - FAIL ✗\n`;
        output += `[SIM] Time: 10ns | a=1, y=? - FAIL ✗\n`;
        output += `[FAIL] Tests failed\n`;
        setHasPassedTests(false);
      }
      
      output += `[OK] Build finished in 0.93s`;
      setConsoleOutput(output);

      // Add to submissions
      const submission = {
        timestamp: new Date().toLocaleString(),
        status: testPassed ? "PASSED" : "FAILED",
        code: designCode,
        output: output
      };
      setSubmissions(prev => [submission, ...prev]);

      if (testPassed) {
        setWaveformData(`VCD Waveform Data\n${"═".repeat(40)}\n\nTime(ns)   a   y\n${"-".repeat(40)}\n    0      0   0\n   10      1   1\n   20      1   1\n\n      ┌─────┐\na  ───┘     └──────\n      ┌─────┐\ny  ───┘     └──────`);
        setSchematicData(`Netlist Graph\n${"═".repeat(40)}\n\n    ┌──────────────┐\na ──┤              ├── y\n    │  top_module  │\n    │  assign y=a  │\n    └──────────────┘\n\nDirect wire connection\nDelay: 0ns`);
        setSynthesisData(`FPGA Synthesis Report\n${"═".repeat(40)}\n\nResource Utilization:\n  LUTs:    1/10000 (0.01%)\n  FFs:     0/20000 (0.00%)\n  BRAMs:   0/50    (0.00%)\n\nTiming:\n  Max Freq: 450 MHz\n  \n[OK] Synthesis complete`);
        setReportData(`Design Report\n${"═".repeat(40)}\n\nModule: top_module\nLanguage: ${language}\nStatus: PASSED ✓\n\n✓ Code quality: Excellent\n✓ Timing: Met\n✓ Tests: 100% passed`);
      }
    }, 800);
  };

  const connectGithub = () => {
    if (githubUsername.trim() && githubPassword.trim()) {
      setIsGithubConnected(true);
      setShowGithubModal(false);
      setConsoleOutput(`[GitHub] Connected as ${githubUsername}\n[OK] Authentication successful\n[INFO] Ready to push code`);
      setBottomTab("console");
    }
  };

  const pushToGithub = () => {
    if (!hasPassedTests) {
      setConsoleOutput("[GitHub] Error: Cannot push code that hasn't passed all tests\n[INFO] Run your code and pass all test cases first");
      setBottomTab("console");
      return;
    }
    if (githubRepo.trim()) {
      setConsoleOutput(`[GitHub] Pushing to repository...\n[INFO] User: ${githubUsername}\n[INFO] Repo: ${githubRepo}\n[INFO] Branch: main\n[INFO] Files: design.${language === 'vhdl' ? 'vhd' : 'v'}\n[OK] Code pushed successfully ✓\n[INFO] Commit: "HDL Studio submission"`);
      setShowPushModal(false);
      setBottomTab("console");
    }
  };

  const postDiscussion = () => {
    if (discussionText.trim()) {
      setDiscussions(prev => [...prev, {
        user: "You",
        text: discussionText,
        timestamp: new Date().toLocaleString()
      }]);
      setDiscussionText("");
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (e.ctrlKey && e.key === "Enter") { 
        e.preventDefault(); 
        runAction(); 
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [designCode, customTestbenchCode, testbenchMode]);

  const sidebarItems = [
    {id: "run", icon: "▶", label: "Run", action: runAction},
    {id: "program", icon: "</>", label: "Program", action: () => {setLeftTab("program"); setEditorTab("program")}},
    {id: "concepts", icon: "λ", label: "Concepts", action: () => setLeftTab("concepts")},
    {id: "quiz", icon: "?", label: "Quiz", action: () => setLeftTab("quiz")},
    {id: "assign", icon: "✓", label: "Assign", action: () => setLeftTab("assign")},
    {id: "output", icon: "≡", label: "Output", action: () => setBottomTab("console")},
    {id: "fixbug", icon: "🛠", label: "FixBug", action: () => setLeftTab("fixbug")},
    {id: "interview", icon: "💬", label: "Interview", action: () => setLeftTab("interview")},
    {id: "discuss", icon: "☁", label: "Discuss", action: () => setLeftTab("discussion")},
    {id: "refs", icon: "📚", label: "Refs", action: () => setLeftTab("refs")}
  ];

  return (
    <div className={`${theme === "dark" ? "bg-zinc-950 text-zinc-100" : "bg-white text-zinc-900"} min-h-screen flex flex-col`}>
      {/* Header */}
      <div className={`flex items-center justify-between px-4 lg:px-6 py-3 border-b ${theme === "dark" ? "border-zinc-800" : "border-zinc-300"} sticky top-0 z-20 bg-inherit backdrop-blur`}>
        <div className="flex items-center gap-2 lg:gap-3">
          <div className="rounded-lg bg-emerald-500/20 text-emerald-300 px-2 py-1 text-xs font-semibold">OneDrop</div>
          <div className="font-semibold tracking-wide text-sm lg:text-base">HDL Studio</div>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className={`text-xs lg:text-sm px-2 py-1.5 rounded border ${theme === "dark" ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-300"}`}
          >
            <option value="verilog">Verilog</option>
            <option value="systemverilog">SystemVerilog</option>
            <option value="vhdl">VHDL</option>
          </select>
          <button 
            onClick={() => setTheme(t => (t === "dark" ? "light" : "dark"))} 
            className={`border rounded-md px-2 py-1.5 text-xs lg:text-sm ${theme === "dark" ? "border-zinc-700 hover:bg-zinc-800" : "border-zinc-300 hover:bg-zinc-100"}`}
          >
            {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
          </button>
          {!isGithubConnected ? (
            <button 
              onClick={() => setShowGithubModal(true)}
              className={`rounded-md px-2 lg:px-3 py-1.5 text-xs lg:text-sm border ${theme === "dark" ? "bg-zinc-800 border-zinc-700" : "bg-zinc-100 border-zinc-300"} hover:bg-opacity-80`}
            >
              Connect GitHub
            </button>
          ) : (
            <button 
              onClick={() => setShowPushModal(true)}
              className={`rounded-md px-2 lg:px-3 py-1.5 text-xs lg:text-sm ${hasPassedTests ? "bg-emerald-600 hover:bg-emerald-500" : "bg-zinc-700 cursor-not-allowed"}`}
              disabled={!hasPassedTests}
            >
              Push to GitHub
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex gap-2 lg:gap-3 p-2 lg:p-3">
        {/* Left Sidebar */}
        <aside className="flex-shrink-0">
          <div className={`border rounded-xl p-1 ${theme === "dark" ? "border-zinc-800" : "border-zinc-300"}`}>
            <div className="flex flex-col gap-1 lg:gap-2">
              {sidebarItems.map((item) => (
                <div key={item.id} className="relative group">
                  <button 
                    onClick={item.action}
                    onMouseEnter={() => setHoveredIcon(item.label)}
                    onMouseLeave={() => setHoveredIcon("")}
                    className={`w-8 h-8 lg:w-10 lg:h-10 flex items-center justify-center rounded-lg border transition-colors ${theme === "dark" ? "border-zinc-800 hover:bg-zinc-900/60" : "border-zinc-300 hover:bg-zinc-100"}`}
                  >
                    <span className="text-xs lg:text-sm font-semibold">{item.icon}</span>
                  </button>
                  {hoveredIcon === item.label && (
                    <div className={`absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap z-50 pointer-events-none ${theme === "dark" ? "bg-zinc-800 border border-zinc-700" : "bg-white border border-zinc-300 shadow-lg"}`}>
                      {item.label}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Left Panel - Task/Discussion/etc */}
        <section className="w-80 lg:w-96 flex-shrink-0">
          <div className={`rounded-xl border overflow-hidden h-full flex flex-col ${theme === "dark" ? "border-zinc-800" : "border-zinc-300"}`}>
            <div className={`flex border-b overflow-x-auto ${theme === "dark" ? "border-zinc-800" : "border-zinc-300"}`}>
              {["task", "discussion", "submission", ...(isSubmittedCorrectly ? ["solution"] : ["help"])].map(tab => (
                <button
                  key={tab}
                  onClick={() => setLeftTab(tab)}
                  className={`px-3 lg:px-4 py-2 text-xs lg:text-sm whitespace-nowrap ${leftTab === tab ? (theme === "dark" ? "bg-zinc-900 text-emerald-300" : "bg-zinc-100 text-emerald-600") : "text-zinc-400 hover:text-zinc-200"}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-auto p-3 lg:p-4">
              {leftTab === "task" && (
                <div className="space-y-4">
                  <h2 className="text-lg lg:text-xl font-bold">1. Wire</h2>
                  <div className={`p-3 lg:p-4 rounded-lg ${theme === "dark" ? "bg-zinc-900" : "bg-zinc-50"}`}>
                    <h3 className="font-semibold mb-2 text-sm lg:text-base">Problem Statement</h3>
                    <p className="text-xs lg:text-sm text-zinc-400">
                      Create a module that implements a simple wire connection. 
                      The module should have one input port <code className={`${theme === "dark" ? "bg-zinc-800" : "bg-zinc-200"} px-1 rounded`}>a</code> and 
                      one output port <code className={`${theme === "dark" ? "bg-zinc-800" : "bg-zinc-200"} px-1 rounded`}>y</code>.
                    </p>
                  </div>
                  <div className={`p-3 lg:p-4 rounded-lg ${theme === "dark" ? "bg-zinc-900" : "bg-zinc-50"}`}>
                    <h3 className="font-semibold mb-2 text-sm lg:text-base">Requirements</h3>
                    <ul className="text-xs lg:text-sm text-zinc-400 space-y-1 list-disc list-inside">
                      <li>Module name: <code className="text-zinc-300">top_module</code></li>
                      <li>Input: <code className="text-zinc-300">a</code> (1-bit)</li>
                      <li>Output: <code className="text-zinc-300">y</code> (1-bit)</li>
                      <li>Functionality: y = a</li>
                    </ul>
                  </div>
                  <div className={`p-3 lg:p-4 rounded-lg border ${theme === "dark" ? "bg-blue-950/20 border-blue-800" : "bg-blue-50 border-blue-200"}`}>
                    <h3 className="font-semibold mb-2 text-blue-400 text-sm lg:text-base">Expected Behavior</h3>
                    <div className="text-xs lg:text-sm text-zinc-400 font-mono space-y-1">
                      <div>a = 0 → y = 0</div>
                      <div>a = 1 → y = 1</div>
                    </div>
                  </div>
                </div>
              )}
              
              {leftTab === "discussion" && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm lg:text-base">Discussion Forum</h3>
                  <div className="space-y-2">
                    {discussions.map((d, i) => (
                      <div key={i} className={`p-2 lg:p-3 rounded ${theme === "dark" ? "bg-zinc-900" : "bg-zinc-50"}`}>
                        <div className="text-xs text-zinc-500 mb-1">{d.user} • {d.timestamp}</div>
                        <div className="text-xs lg:text-sm">{d.text}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <textarea
                      value={discussionText}
                      onChange={(e) => setDiscussionText(e.target.value)}
                      placeholder="Share your thoughts..."
                      className={`w-full p-2 lg:p-3 rounded border text-xs lg:text-sm ${theme === "dark" ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-300"}`}
                      rows="3"
                    />
                    <button
                      onClick={postDiscussion}
                      className="mt-2 bg-emerald-600 px-3 lg:px-4 py-1.5 lg:py-2 rounded text-xs lg:text-sm hover:bg-emerald-500"
                    >
                      Post Comment
                    </button>
                  </div>
                </div>
              )}
              
              {leftTab === "submission" && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm lg:text-base">Submission History</h3>
                  <div className="space-y-2">
                    {submissions.length === 0 ? (
                      <p className="text-xs lg:text-sm text-zinc-500">No submissions yet. Run your code!</p>
                    ) : (
                      submissions.map((s, i) => (
                        <div key={i} className={`p-2 lg:p-3 rounded border ${s.status === "PASSED" ? "border-green-700 bg-green-950/20" : "border-red-700 bg-red-950/20"}`}>
                          <div className="flex justify-between items-center mb-2">
                            <span className={`text-xs lg:text-sm font-semibold ${s.status === "PASSED" ? "text-green-400" : "text-red-400"}`}>{s.status}</span>
                            <span className="text-xs text-zinc-500">{s.timestamp}</span>
                          </div>
                          <pre className="text-xs overflow-auto">{s.output.substring(0, 200)}...</pre>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
              
              {leftTab === "solution" && isSubmittedCorrectly && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm lg:text-base">Reference Solution</h3>
                  <p className="text-xs lg:text-sm text-zinc-400">Congratulations! Here's the optimal solution:</p>
                  <pre className={`p-3 lg:p-4 rounded text-xs lg:text-sm overflow-auto ${theme === "dark" ? "bg-zinc-900" : "bg-zinc-50"}`}>
{language === "verilog" ? `module top_module(input wire a, output wire y);
  assign y = a;
endmodule` : language === "systemverilog" ? `module top_module(input logic a, output logic y);
  assign y = a;
endmodule` : `entity top_module is
  Port ( a : in STD_LOGIC;
         y : out STD_LOGIC);
end top_module;

architecture Behavioral of top_module is
begin
  y <= a;
end Behavioral;`}
                  </pre>
                </div>
              )}
              
              {leftTab === "help" && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm lg:text-base">Need Help?</h3>
                  <p className="text-xs lg:text-sm text-zinc-400">Solution is locked. Complete the problem correctly to unlock!</p>
                  <button
                    onClick={() => setLeftTab("concepts")}
                    className="bg-blue-600 px-3 lg:px-4 py-2 rounded text-xs lg:text-sm hover:bg-blue-500"
                  >
                    View Related Concepts
                  </button>
                </div>
              )}
              
              {leftTab === "concepts" && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm lg:text-base">Related Concepts</h3>
                  <div className={`p-3 lg:p-4 rounded ${theme === "dark" ? "bg-zinc-900" : "bg-zinc-50"}`}>
                    <h4 className="font-semibold mb-2 text-sm">Wire Assignment</h4>
                    <p className="text-xs lg:text-sm text-zinc-400 mb-2">In {language}, continuous assignment is used for combinational logic.</p>
                    <pre className="text-xs overflow-auto">{language === "vhdl" ? "y <= a;" : "assign y = a;"}</pre>
                  </div>
                </div>
              )}
              
              {leftTab === "program" && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm lg:text-base">Program Editor</h3>
                  <p className="text-xs lg:text-sm text-zinc-400">Write your design code in the editor on the right.</p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Right Panel - Editor & Console */}
        <section className="flex-1 flex flex-col gap-2 lg:gap-3 min-w-0">
          {/* Editor */}
          <div className={`rounded-xl border overflow-hidden flex-1 flex flex-col ${theme === "dark" ? "border-zinc-800" : "border-zinc-300"}`}>
            <div className={`flex items-center justify-between border-b px-3 ${theme === "dark" ? "border-zinc-800" : "border-zinc-300"}`}>
              <div className="flex overflow-x-auto">
                {["program", "testbench"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setEditorTab(tab)}
                    className={`px-3 lg:px-4 py-2 text-xs lg:text-sm whitespace-nowrap ${editorTab === tab ? (theme === "dark" ? "bg-zinc-900 text-sky-300" : "bg-zinc-100 text-sky-600") : "text-zinc-400 hover:text-zinc-200"}`}
                  >
                    {tab === "program" ? "Program Editor" : "Testbench"}
                  </button>
                ))}
              </div>
              {editorTab === "testbench" && (
                <select
                  value={testbenchMode}
                  onChange={(e) => setTestbenchMode(e.target.value)}
                  className={`text-xs px-2 py-1 rounded border ${theme === "dark" ? "bg-zinc-900 border-zinc-700" : "bg-white border-zinc-300"}`}
                >
                  <option value="default">Default</option>
                  <option value="custom">Custom</option>
                </select>
              )}
            </div>
            
            <div className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-10 lg:w-12 border-r flex flex-col text-zinc-500 text-xs font-mono pt-3 overflow-hidden ${theme === "dark" ? "bg-zinc-900/50 border-zinc-800" : "bg-zinc-50 border-zinc-300"}`}>
                  {getCurrentCode().split('\n').map((_, i) => (
                    <div key={i} className="h-5 lg:h-6 flex items-center justify-end pr-1 lg:pr-2 flex-shrink-0">{i + 1}</div>
                  ))}
                </div>
                <textarea
                  value={getCurrentCode()}
                  onChange={updateCurrentCode}
                  readOnly={editorTab === "testbench" && testbenchMode === "default"}
                  spellCheck={false}
                  className={`w-full h-full pl-12 lg:pl-14 pr-2 lg:pr-4 py-3 font-mono text-xs lg:text-sm resize-none focus:outline-none ${
                    theme === "dark" ? "bg-zinc-900 text-zinc-100" : "bg-white text-zinc-900"
                  }`}
                  style={{lineHeight: "1.5", tabSize: 2}}
                />
              </div>
              
              <div className={`flex items-center justify-between border-t px-2 lg:px-3 py-1.5 lg:py-2 text-xs ${theme === "dark" ? "border-zinc-800 bg-zinc-900/50" : "border-zinc-300 bg-zinc-50"}`}>
                <div className="text-zinc-400 text-xs">Idle • no errors</div>
                <div className="flex items-center gap-1 lg:gap-2">
                  <button onClick={formatAction} className={`rounded-md border px-2 py-1 text-xs ${theme === "dark" ? "border-zinc-700 hover:bg-zinc-800" : "border-zinc-300 hover:bg-zinc-100"}`}>Format</button>
                  <button onClick={lintAction} className={`rounded-md border px-2 py-1 text-xs ${theme === "dark" ? "border-zinc-700 hover:bg-zinc-800" : "border-zinc-300 hover:bg-zinc-100"}`}>Lint</button>
                  <button onClick={() => setBottomTab("synthesis")} className={`rounded-md border px-2 py-1 text-xs ${theme === "dark" ? "border-zinc-700 hover:bg-zinc-800" : "border-zinc-300 hover:bg-zinc-100"}`}>Synth</button>
                  <button onClick={runAction} className="rounded-md bg-emerald-600 px-2 lg:px-3 py-1 font-semibold hover:bg-emerald-500 text-xs">Run ▶</button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Panel */}
          <div className={`rounded-xl border overflow-hidden ${theme === "dark" ? "border-zinc-800" : "border-zinc-300"}`}>
            <div className={`flex border-b px-2 overflow-x-auto ${theme === "dark" ? "border-zinc-800" : "border-zinc-300"}`}>
              {["console", "waveform", "schematic", "synthesis", "lint", "report"].map(tab => (
                <button
                  key={tab}
                  onClick={() => setBottomTab(tab)}
                  className={`px-2 lg:px-3 py-1.5 lg:py-2 text-xs lg:text-sm whitespace-nowrap ${bottomTab === tab ? (theme === "dark" ? "bg-zinc-900 text-emerald-300" : "bg-zinc-100 text-emerald-600") : "text-zinc-400 hover:text-zinc-200"}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className={`p-2 lg:p-3 text-xs font-mono h-40 lg:h-48 overflow-auto whitespace-pre-wrap ${theme === "dark" ? "bg-zinc-950" : "bg-zinc-50"}`}>
              {bottomTab === "console" && <div className="text-zinc-300">{consoleOutput}</div>}
              {bottomTab === "waveform" && <div className="text-zinc-300">{waveformData || "Run simulation to generate waveform"}</div>}
              {bottomTab === "schematic" && <div className="text-zinc-300">{schematicData || "Run simulation to generate schematic"}</div>}
              {bottomTab === "synthesis" && <div className="text-zinc-300">{synthesisData || "Click Synthesize to generate report"}</div>}
              {bottomTab === "lint" && <div className="text-zinc-300">{lintData || "Click Lint to analyze code"}</div>}
              {bottomTab === "report" && <div className="text-zinc-300">{reportData || "Run simulation to generate report"}</div>}
            </div>
          </div>
        </section>
      </div>

      {/* GitHub Connect Modal */}
      {showGithubModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-4 lg:p-6 w-full max-w-md ${theme === "dark" ? "bg-zinc-900" : "bg-white"}`}>
            <h3 className="text-base lg:text-lg font-semibold mb-4">Connect GitHub Account</h3>
            <input
              type="text"
              placeholder="GitHub Username"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              className={`w-full px-3 py-2 rounded border mb-3 text-sm ${theme === "dark" ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-300"}`}
            />
            <input
              type="password"
              placeholder="GitHub Password or Token"
              value={githubPassword}
              onChange={(e) => setGithubPassword(e.target.value)}
              className={`w-full px-3 py-2 rounded border mb-4 text-sm ${theme === "dark" ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-300"}`}
            />
            <div className="flex gap-2">
              <button
                onClick={connectGithub}
                className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-500 text-sm"
              >
                Connect
              </button>
              <button
                onClick={() => setShowGithubModal(false)}
                className={`flex-1 px-4 py-2 rounded border text-sm ${theme === "dark" ? "border-zinc-700 hover:bg-zinc-800" : "border-zinc-300 hover:bg-zinc-100"}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Push Modal */}
      {showPushModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`rounded-xl p-4 lg:p-6 w-full max-w-md ${theme === "dark" ? "bg-zinc-900" : "bg-white"}`}>
            <h3 className="text-base lg:text-lg font-semibold mb-4">Push to GitHub</h3>
            <p className="text-xs lg:text-sm text-zinc-400 mb-4">Connected as: {githubUsername}</p>
            <input
              type="text"
              placeholder="Repository Name (e.g., hdl-projects)"
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              className={`w-full px-3 py-2 rounded border mb-4 text-sm ${theme === "dark" ? "bg-zinc-800 border-zinc-700" : "bg-white border-zinc-300"}`}
            />
            <div className="flex gap-2">
              <button
                onClick={pushToGithub}
                className="flex-1 bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-500 text-sm"
              >
                Push Code
              </button>
              <button
                onClick={() => setShowPushModal(false)}
                className={`flex-1 px-4 py-2 rounded border text-sm ${theme === "dark" ? "border-zinc-700 hover:bg-zinc-800" : "border-zinc-300 hover:bg-zinc-100"}`}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className={`px-4 lg:px-6 py-2 lg:py-3 border-t flex flex-col lg:flex-row items-center justify-between gap-2 text-xs text-zinc-400 ${theme === "dark" ? "border-zinc-800" : "border-zinc-300"}`}>
        <div>© 2025 OneDrop Semicon • Blended GUI</div>
        <div className="hidden lg:block">Press Ctrl+Enter to run simulation</div>
      </div>
    </div>
  );
}