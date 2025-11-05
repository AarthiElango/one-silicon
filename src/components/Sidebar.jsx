import React from 'react';
import { 
  Play, 
  FileCode, 
  Terminal, 
  Layers, 
  CheckCircle, 
  Settings, 
  MessageCircle, 
  Zap, 
  Home 
} from 'lucide-react';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip.jsx';

export default function Sidebar({ theme }) {
  const sidebarItems = [
    { icon: Play, label: 'Run', color: 'text-orange-500' },
    { icon: FileCode, label: 'Code Editor' },
    { icon: Terminal, label: 'Terminal' },
    { icon: Layers, label: 'Hierarchy' },
    { icon: CheckCircle, label: 'Verification' },
    { icon: Settings, label: 'Settings' },
    { icon: MessageCircle, label: 'Help' },
    { icon: Zap, label: 'Quick Actions' },
    { icon: Home, label: 'Home' }
  ];

  return (
    <div
      className={`w-16 flex flex-col items-center py-4 gap-2 border-r ${
        theme === 'dark' ? 'bg-[#0f0f0f] border-gray-800' : 'bg-gray-50 border-gray-200'
      }`}
    >
      <TooltipProvider>
        {sidebarItems.map((item, index) => (
          <Tooltip key={index}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className={`w-10 h-10 ${
                  index === 0 ? item.color : 'text-gray-400 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
      </TooltipProvider>
    </div>
  );
}
