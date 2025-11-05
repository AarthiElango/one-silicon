import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "../../lib/utils";  // Change from "../utils"
export function Tabs({ className, ...props }) {
  return (
    <TabsPrimitive.Root className={cn("flex flex-col gap-2", className)} {...props} />
  );
}

export function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn("bg-muted inline-flex h-9 rounded-xl p-[3px]", className)}
      {...props}
    />
  );
}

export function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn("h-[calc(100%-1px)] px-2 py-1 text-sm font-medium", className)}
      {...props}
    />
  );
}

export function TabsContent({ className, ...props }) {
  return (
    <TabsPrimitive.Content className={cn("flex-1 outline-none", className)} {...props} />
  );
}
