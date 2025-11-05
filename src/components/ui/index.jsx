// src/components/ui/index.jsx
export { Alert, AlertTitle, AlertDescription } from "./alert";
export { Button } from "./button";
export { Input } from "./input";
export { Label } from "./label";
// FIXED: Export the actual resizable components (no 'Resizable' exists, so use the real ones)
export { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./resizable";
// Optional: If you want a single 'Resizable' alias for ResizablePanelGroup, use this instead:
// export { ResizablePanelGroup as Resizable, ResizableHandle, ResizablePanel } from "./resizable";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
// Add any other UI components here as needed