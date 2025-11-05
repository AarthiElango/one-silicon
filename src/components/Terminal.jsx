import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import ViEditor from './ViEditor';
import GitHubAuth from './GitHubAuth';
import { GitHubService } from '../utils/github';

export default function Terminal({ onCommand, theme }) {
  const [lines, setLines] = useState([
    { type: 'output', content: 'Ubuntu 22.04.3 LTS - Verilog Development Environment' },
    { type: 'output', content: 'Welcome to HDL Studio Terminal with Git/GitHub Integration' },
    { type: 'output', content: '' },
    { type: 'success', content: '🚀 Quick Start with Git:' },
    { type: 'output', content: '  1. git init' },
    { type: 'output', content: '  2. git config user.name "Your Name"' },
    { type: 'output', content: '  3. git config user.email "your@email.com"' },
    { type: 'output', content: '  4. git add .' },
    { type: 'output', content: '  5. git commit -m "Initial commit"' },
    { type: 'output', content: '  6. git push (will prompt for GitHub authentication)' },
    { type: 'output', content: '' },
    { type: 'output', content: 'Available tools: iverilog, vvp, gtkwave, vim, git' },
    { type: 'output', content: 'Type "help" for all available commands' },
    { type: 'output', content: '' }
  ]);

  const [currentInput, setCurrentInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDirectory, setCurrentDirectory] = useState('~/hdl-workspace');
  const [viMode, setViMode] = useState(false);
  const [viFilename, setViFilename] = useState('');
  const [showGitHubAuth, setShowGitHubAuth] = useState(false);
  const [gitConfig, setGitConfig] = useState({ username: '', email: '' });
  const [gitState, setGitState] = useState({
    initialized: false,
    branch: 'main',
    stagedFiles: new Set(),
    commits: [],
    remoteConfigured: false
  });
  const [githubService, setGithubService] = useState(null);

  const [fileSystem, setFileSystem] = useState({
    'counter.v': `module counter(
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
endmodule`,

    'counter_tb.v': `\`timescale 1ns/1ps

module counter_tb;
    reg clk;
    reg rst;
    wire [3:0] count;
    
    counter uut (
        .clk(clk),
        .rst(rst),
        .count(count)
    );
    
    initial begin
        clk = 0;
        forever #5 clk = ~clk;
    end
    
    initial begin
        $dumpfile("counter.vcd");
        $dumpvars(0, counter_tb);
        
        rst = 1;
        #10 rst = 0;
        
        #100 $finish;
    end
    
    initial begin
        $monitor("Time=%0t Counter=%b", $time, count);
    end
endmodule`,

    'README.md': '# HDL Workspace\n\nThis is your Verilog development workspace.\n\nType "cat GIT_GUIDE.md" to learn about Git/GitHub integration!',

    'GIT_GUIDE.md': `# Git/GitHub Quick Guide

🚀 QUICK START:
1. git init
2. git config user.name "Your Name"
3. git config user.email "your@email.com"
4. git add .
5. git commit -m "Initial commit"
6. git push

📝 Create GitHub Token:
- Go to github.com/settings/tokens
- Generate new token (classic)
- Select "repo" scope
- Copy and paste when prompted

💡 Common Commands:
- git status     : Check what's changed
- git add .      : Stage all files
- git commit -m  : Save changes
- git log        : View history
- git push       : Upload to GitHub
- github         : Check connection

Need help? Type "help" for all commands!`
  });

  const inputRef = useRef(null);
  const terminalRef = useRef(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [lines]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentInput.trim()) return;

    const command = currentInput.trim();
    setLines((prev) => [...prev, { type: 'command', content: `user@hdl-studio:${currentDirectory}$ ${command}` }]);
    setCommandHistory((prev) => [...prev, command]);
    setHistoryIndex(-1);

    if (onCommand) {
      onCommand(command);
    }

    await processCommand(command);
    setCurrentInput('');
  };

  // ===================== GIT COMMAND HANDLER ===================== //
  const handleGitCommand = async (args) => {
    const subcommand = args[0];

    switch (subcommand) {
      case 'init':
        setGitState((prev) => ({ ...prev, initialized: true }));
        setLines((prev) => [
          ...prev,
          { type: 'output', content: 'Initialized empty Git repository in ~/hdl-workspace/.git/' },
          { type: 'output', content: '' }
        ]);
        break;

      case 'config':
        if (args[1] === 'user.name') {
          if (args[2]) {
            setGitConfig((prev) => ({ ...prev, username: args.slice(2).join(' ') }));
            setLines((prev) => [...prev, { type: 'output', content: '' }]);
          } else {
            setLines((prev) => [...prev, { type: 'output', content: gitConfig.username || '' }, { type: 'output', content: '' }]);
          }
        } else if (args[1] === 'user.email') {
          if (args[2]) {
            setGitConfig((prev) => ({ ...prev, email: args.slice(2).join(' ') }));
            setLines((prev) => [...prev, { type: 'output', content: '' }]);
          } else {
            setLines((prev) => [...prev, { type: 'output', content: gitConfig.email || '' }, { type: 'output', content: '' }]);
          }
        } else if (args[1] === '--list') {
          setLines((prev) => [
            ...prev,
            { type: 'output', content: `user.name=${gitConfig.username}` },
            { type: 'output', content: `user.email=${gitConfig.email}` },
            { type: 'output', content: '' }
          ]);
        }
        break;

      case 'add':
        if (!gitState.initialized) {
          setLines((prev) => [
            ...prev,
            { type: 'error', content: 'fatal: not a git repository (or any of the parent directories): .git' },
            { type: 'output', content: '' }
          ]);
          return;
        }

        if (args[1] === '.') {
          const allFiles = Object.keys(fileSystem);
          setGitState((prev) => ({
            ...prev,
            stagedFiles: new Set([...prev.stagedFiles, ...allFiles])
          }));
          setLines((prev) => [...prev, { type: 'output', content: '' }]);
        } else if (args[1]) {
          const filename = args[1];
          if (fileSystem[filename]) {
            setGitState((prev) => ({
              ...prev,
              stagedFiles: new Set([...prev.stagedFiles, filename])
            }));
            setLines((prev) => [...prev, { type: 'output', content: '' }]);
          } else {
            setLines((prev) => [
              ...prev,
              { type: 'error', content: `fatal: pathspec '${filename}' did not match any files` },
              { type: 'output', content: '' }
            ]);
          }
        }
        break;

      case 'status':
        if (!gitState.initialized) {
          setLines((prev) => [
            ...prev,
            { type: 'error', content: 'fatal: not a git repository (or any of the parent directories): .git' },
            { type: 'output', content: '' }
          ]);
          return;
        }

        const stagedArray = Array.from(gitState.stagedFiles);
        const unstagedFiles = Object.keys(fileSystem).filter((f) => !gitState.stagedFiles.has(f));

        setLines((prev) => [
          ...prev,
          { type: 'output', content: `On branch ${gitState.branch}` },
          { type: 'output', content: '' },
          ...(stagedArray.length > 0
            ? [
                { type: 'output', content: 'Changes to be committed:' },
                { type: 'output', content: '  (use "git restore --staged <file>..." to unstage)' },
                ...stagedArray.map((f) => ({ type: 'success', content: `\tnew file:   ${f}` })),
                { type: 'output', content: '' }
              ]
            : []),
          ...(unstagedFiles.length > 0
            ? [
                { type: 'output', content: 'Untracked files:' },
                { type: 'output', content: '  (use "git add <file>..." to include in what will be committed)' },
                ...unstagedFiles.map((f) => ({ type: 'error', content: `\t${f}` })),
                { type: 'output', content: '' }
              ]
            : []),
          { type: 'output', content: '' }
        ]);
        break;

      case 'commit':
        if (!gitState.initialized) {
          setLines((prev) => [
            ...prev,
            { type: 'error', content: 'fatal: not a git repository (or any of the parent directories): .git' },
            { type: 'output', content: '' }
          ]);
          return;
        }

        if (gitState.stagedFiles.size === 0) {
          setLines((prev) => [
            ...prev,
            { type: 'error', content: 'nothing to commit, working tree clean' },
            { type: 'output', content: '' }
          ]);
          return;
        }

        const messageIndex = args.indexOf('-m');
        if (messageIndex === -1 || !args[messageIndex + 1]) {
          setLines((prev) => [
            ...prev,
            { type: 'error', content: 'error: pathspec \'-m\' did not match any file(s) known to git' },
            { type: 'output', content: 'Usage: git commit -m "commit message"' },
            { type: 'output', content: '' }
          ]);
          return;
        }

        const commitMessage = args.slice(messageIndex + 1).join(' ').replace(/['"]/g, '');
        const commitHash = Math.random().toString(36).substring(2, 9);
        const commitDate = new Date().toISOString();

        setGitState((prev) => ({
          ...prev,
          commits: [...prev.commits, { hash: commitHash, message: commitMessage, date: commitDate }],
          stagedFiles: new Set()
        }));

        setLines((prev) => [
          ...prev,
          { type: 'output', content: `[${gitState.branch} ${commitHash}] ${commitMessage}` },
          { type: 'output', content: ` ${gitState.stagedFiles.size} file(s) changed` },
          { type: 'output', content: '' }
        ]);
        break;

      case 'push':
        if (!gitState.initialized) {
          setLines((prev) => [
            ...prev,
            { type: 'error', content: 'fatal: not a git repository (or any of the parent directories): .git' },
            { type: 'output', content: '' }
          ]);
          return;
        }

        if (!gitState.remoteConfigured) {
          setLines((prev) => [
            ...prev,
            { type: 'output', content: 'Setting up GitHub remote...' },
            { type: 'output', content: 'Opening GitHub authentication...' },
            { type: 'output', content: '' }
          ]);
          setShowGitHubAuth(true);
          return;
        }

        if (gitState.commits.length === 0) {
          setLines((prev) => [
            ...prev,
            { type: 'error', content: 'error: failed to push some refs' },
            { type: 'output', content: 'hint: Updates were rejected because the remote contains work that you do not have locally.' },
            { type: 'output', content: 'hint: You may want to first integrate the remote changes (e.g., \'git pull ...\')' },
            { type: 'output', content: '' }
          ]);
          return;
        }

        if (!githubService) {
          setLines((prev) => [
            ...prev,
            { type: 'error', content: 'fatal: GitHub service not initialized' },
            { type: 'output', content: '' }
          ]);
          return;
        }

        setLines((prev) => [
          ...prev,
          { type: 'output', content: 'Enumerating objects...' },
          { type: 'output', content: 'Counting objects: 100% done.' },
          { type: 'output', content: 'Compressing objects: 100% done.' },
          { type: 'output', content: 'Writing objects: 100% done.' }
        ]);

        try {
          const files = Object.keys(fileSystem).map((path) => ({
            path,
            content: fileSystem[path]
          }));

          const lastCommit = gitState.commits[gitState.commits.length - 1];
          await githubService.pushFiles(files, lastCommit.message);

          setLines((prev) => [
            ...prev,
            { type: 'success', content: `✓ Successfully pushed to ${githubService.getRepoUrl()}` },
            { type: 'output', content: `To ${githubService.getRepoUrl()}.git` },
            { type: 'output', content: `   ${lastCommit.hash}..${lastCommit.hash}  ${gitState.branch} -> ${gitState.branch}` },
            { type: 'output', content: '' }
          ]);
        } catch (error) {
          setLines((prev) => [
            ...prev,
            { type: 'error', content: `error: failed to push to GitHub: ${error instanceof Error ? error.message : 'Unknown error'}` },
            { type: 'output', content: '' }
          ]);
        }
        break;

      default:
        setLines((prev) => [
          ...prev,
          { type: 'error', content: `git: '${subcommand}' is not a git command. See 'git --help'.` },
          { type: 'output', content: '' }
        ]);
    }
  };

  const handleGitHubAuth = (token, username, repoName) => {
    const service = new GitHubService({ token, username, repoName });
    setGithubService(service);
    setGitConfig((prev) => ({ ...prev, token, repoName }));
    setGitState((prev) => ({ ...prev, remoteConfigured: true }));
    setShowGitHubAuth(false);

    setLines((prev) => [
      ...prev,
      { type: 'success', content: `✓ Connected to GitHub as ${username}` },
      { type: 'output', content: `Repository: https://github.com/${username}/${repoName}` },
      { type: 'output', content: '' }
    ]);
  };

  // =============== PROCESS COMMANDS (SYSTEM + GIT + TOOLS) =============== //
  const processCommand = async (command) => {
    const parts = command.split(' ');
    const cmd = parts[0];

    switch (cmd) {
      case 'git':
        await handleGitCommand(parts.slice(1));
        break;

      case 'help':
        setLines((prev) => [
          ...prev,
          { type: 'output', content: 'Available commands:' },
          { type: 'output', content: '' },
          { type: 'output', content: 'File Operations:' },
          { type: 'output', content: '  vim/vi <file>                   - Edit file in Vi editor' },
          { type: 'output', content: '  ls                              - List files' },
          { type: 'output', content: '  cat <file>                      - Display file contents' },
          { type: 'output', content: '' },
          { type: 'output', content: 'Verilog Tools:' },
          { type: 'output', content: '  iverilog <file.v> -o <output>  - Compile Verilog code' },
          { type: 'output', content: '  vvp <output>                    - Run simulation' },
          { type: 'output', content: '  gtkwave <file.vcd>              - View waveforms' },
          { type: 'output', content: '' },
          { type: 'output', content: 'Git Commands:' },
          { type: 'output', content: '  git init                        - Initialize repository' },
          { type: 'output', content: '  git config user.name "Name"     - Set username' },
          { type: 'output', content: '  git config user.email "email"   - Set email' },
          { type: 'output', content: '  git add <file> / git add .      - Stage files' },
          { type: 'output', content: '  git commit -m "message"         - Commit changes' },
          { type: 'output', content: '  git status                      - Check status' },
          { type: 'output', content: '  git log                         - View commit history' },
          { type: 'output', content: '  git push                        - Push to GitHub' },
          { type: 'output', content: '' },
          { type: 'output', content: 'System:' },
          { type: 'output', content: '  clear, pwd, whoami, date, echo  - System commands' },
          { type: 'output', content: '' }
        ]);
        break;

      case 'ls': {
        const files = Object.keys(fileSystem).join('  ');
        const simFiles = 'counter.vvp  counter.vcd';
        setLines((prev) => [...prev, { type: 'output', content: `${files}  ${simFiles}` }, { type: 'output', content: '' }]);
        break;
      }

      case 'pwd':
        setLines((prev) => [...prev, { type: 'output', content: '/home/user/hdl-workspace' }, { type: 'output', content: '' }]);
        break;

      case 'clear':
        setLines([]);
        break;

      case 'iverilog':
        if (parts.length < 2) {
          setLines((prev) => [
            ...prev,
            { type: 'error', content: 'Error: No input file specified' },
            { type: 'output', content: 'Usage: iverilog <file.v> -o <output>' },
            { type: 'output', content: '' }
          ]);
        } else {
          const inputFile = parts[1];
          const outputFile = parts[3] || 'a.out';
          setLines((prev) => [
            ...prev,
            { type: 'output', content: `Compiling ${inputFile}...` },
            { type: 'output', content: 'Synthesis successful!' },
            { type: 'output', content: `Output written to ${outputFile}` },
            { type: 'output', content: '' }
          ]);
        }
        break;

      case 'vvp':
        if (parts.length < 2) {
          setLines((prev) => [
            ...prev,
            { type: 'error', content: 'Error: No input file specified' },
            { type: 'output', content: '' }
          ]);
        } else {
          setLines((prev) => [
            ...prev,
            { type: 'output', content: 'VCD info: dumpfile counter.vcd opened for output.' },
            { type: 'output', content: 'Time=0 Counter=0000' },
            { type: 'output', content: 'Time=5 Counter=0001' },
            { type: 'output', content: 'Time=10 Counter=0010' },
            { type: 'output', content: 'Time=15 Counter=0011' },
            { type: 'output', content: 'Time=20 Counter=0100' },
            { type: 'output', content: 'Simulation completed successfully' },
            { type: 'output', content: '' }
          ]);
        }
        break;

      case 'gtkwave':
        if (parts.length < 2) {
          setLines((prev) => [
            ...prev,
            { type: 'error', content: 'Error: No VCD file specified' },
            { type: 'output', content: '' }
          ]);
        } else {
          setLines((prev) => [
            ...prev,
            { type: 'output', content: `Loading ${parts[1]}...` },
            { type: 'output', content: 'GTKWave window opened (see Waveform tab)' },
            { type: 'output', content: '' }
          ]);
        }
        break;

      case 'cat':
        if (parts.length < 2) {
          setLines((prev) => [
            ...prev,
            { type: 'error', content: 'Error: No file specified' },
            { type: 'output', content: '' }
          ]);
        } else {
          const filename = parts[1];
          if (fileSystem[filename]) {
            const fileLines = fileSystem[filename].split('\n');
            setLines((prev) => [...prev, ...fileLines.map((line) => ({ type: 'output', content: line })), { type: 'output', content: '' }]);
          } else {
            setLines((prev) => [
              ...prev,
              { type: 'error', content: `cat: ${filename}: No such file or directory` },
              { type: 'output', content: '' }
            ]);
          }
        }
        break;

      case 'vim':
      case 'vi':
        if (parts.length < 2) {
          setLines((prev) => [
            ...prev,
            { type: 'error', content: 'Error: No file specified' },
            { type: 'output', content: 'Usage: vim <filename>' },
            { type: 'output', content: '' }
          ]);
        } else {
          const filename = parts[1];
          setViFilename(filename);
          setViMode(true);
        }
        break;

      case 'nano':
        setLines((prev) => [
          ...prev,
          { type: 'output', content: `Use 'vim ${parts[1] || 'filename'}' for the integrated editor` },
          { type: 'output', content: '' }
        ]);
        break;

      case 'whoami':
        setLines((prev) => [...prev, { type: 'output', content: 'user' }, { type: 'output', content: '' }]);
        break;

      case 'date':
        setLines((prev) => [...prev, { type: 'output', content: new Date().toString() }, { type: 'output', content: '' }]);
        break;

      case 'echo':
        setLines((prev) => [...prev, { type: 'output', content: parts.slice(1).join(' ') }, { type: 'output', content: '' }]);
        break;

      case 'github':
        if (githubService) {
          const repoUrl = githubService.getRepoUrl();
          setLines((prev) => [
            ...prev,
            { type: 'success', content: '✓ GitHub Connected' },
            { type: 'output', content: `Repository: ${repoUrl}` },
            { type: 'output', content: `Username: ${gitConfig.username}` },
            { type: 'output', content: '' }
          ]);
        } else {
          setLines((prev) => [
            ...prev,
            { type: 'output', content: 'GitHub not connected. Use "git push" to connect.' },
            { type: 'output', content: '' }
          ]);
        }
        break;

      default:
        setLines((prev) => [
          ...prev,
          { type: 'error', content: `Command not found: ${cmd}` },
          { type: 'output', content: 'Type "help" for available commands' },
          { type: 'output', content: '' }
        ]);
    }
  };

  const handleViClose = (content, saved) => {
    if (saved && content !== undefined) {
      setFileSystem((prev) => ({
        ...prev,
        [viFilename]: content
      }));
      setLines((prev) => [...prev, { type: 'output', content: `"${viFilename}" written` }, { type: 'output', content: '' }]);
    }
    setViMode(false);
    setViFilename('');
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex + 1;
        if (newIndex < commandHistory.length) {
          setHistoryIndex(newIndex);
          setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
        }
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentInput(commandHistory[commandHistory.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentInput('');
      }
    }
  };

  if (viMode) {
    return (
      <div className="h-full">
        <ViEditor filename={viFilename} initialContent={fileSystem[viFilename] || ''} onClose={handleViClose} theme={theme} />
      </div>
    );
  }

  return (
    <>
      {showGitHubAuth && (
        <GitHubAuth
          onAuth={handleGitHubAuth}
          onCancel={() => {
            setShowGitHubAuth(false);
            setLines((prev) => [...prev, { type: 'output', content: 'GitHub authentication cancelled' }, { type: 'output', content: '' }]);
          }}
          theme={theme}
        />
      )}

      <div
        className={`h-full flex flex-col font-mono text-sm ${
          theme === 'dark' ? 'bg-[#300a24] text-white' : 'bg-purple-900 text-white'
        }`}
        onClick={() => inputRef.current?.focus()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-1 bg-[#2d0922] border-b border-purple-800">
          <div className="flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600 cursor-pointer"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600 cursor-pointer"></div>
              <div className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600 cursor-pointer"></div>
            </div>
            <span className="text-xs text-purple-200 ml-2">user@hdl-studio: {currentDirectory}</span>
          </div>
          <X className="w-4 h-4 text-purple-300 hover:text-white cursor-pointer" />
        </div>

        {/* Terminal Output */}
        <div ref={terminalRef} className="flex-1 overflow-auto p-2 space-y-0.5">
          {lines.map((line, index) => (
            <div
              key={index}
              className={`${
                line.type === 'command'
                  ? 'text-green-400'
                  : line.type === 'error'
                  ? 'text-red-400'
                  : line.type === 'success'
                  ? 'text-emerald-400'
                  : 'text-white'
              }`}
            >
              {line.content}
            </div>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex items-center px-2 pb-2">
          <span className="text-green-400 mr-2">user@hdl-studio:{currentDirectory}$</span>
          <input
            ref={inputRef}
            type="text"
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent outline-none text-white"
            autoFocus
            spellCheck="false"
          />
        </form>
      </div>
    </>
  );
}
