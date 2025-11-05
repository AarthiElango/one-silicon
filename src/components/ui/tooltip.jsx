import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "../../lib/utils";  // Change from "../utils"

export function TooltipProvider({ delayDuration = 0, ...props }) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />;
}

export function Tooltip(props) {
  return <TooltipPrimitive.Root {...props} />;
}

export function TooltipTrigger(props) {
  return <TooltipPrimitive.Trigger {...props} />;
}

export function TooltipContent({ className, sideOffset = 0, children, ...props }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        sideOffset={sideOffset}
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 rounded-md px-3 py-1.5 text-xs",
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary size-2.5 rotate-45" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
