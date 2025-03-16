"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
}

const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
    const [selectedValue, setSelectedValue] = React.useState(value || defaultValue);

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    const handleValueChange = (newValue: string) => {
      setSelectedValue(newValue);
      if (onValueChange) {
        onValueChange(newValue);
      }
    };

    return (
      <div
        ref={ref}
        className={cn("tabs", className)}
        data-value={selectedValue}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child as React.ReactElement<TabsListProps | TabsTriggerProps | TabsContentProps>, {
              value: selectedValue,
              onValueChange: handleValueChange,
            });
          }
          return child;
        })}
      </div>
    );
  }
);
Tabs.displayName = "Tabs";

type TabsListProps = React.HTMLAttributes<HTMLDivElement>

const TabsList = React.forwardRef<HTMLDivElement, TabsListProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsList.displayName = "TabsList";

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const tabsContext = React.useContext(TabsContext);
    const isActive = value === tabsContext?.value;

    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          isActive
            ? "bg-background text-foreground shadow-sm"
            : "hover:bg-background/80 hover:text-foreground",
          className
        )}
        onClick={() => tabsContext?.onValueChange?.(value)}
        data-state={isActive ? "active" : "inactive"}
        {...props}
      >
        {children}
      </button>
    );
  }
);
TabsTrigger.displayName = "TabsTrigger";

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const tabsContext = React.useContext(TabsContext);
    const isActive = value === tabsContext?.value;

    if (!isActive) return null;

    return (
      <div
        ref={ref}
        className={cn(
          "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          className
        )}
        data-state={isActive ? "active" : "inactive"}
        {...props}
      >
        {children}
      </div>
    );
  }
);
TabsContent.displayName = "TabsContent";

// Create context to manage tabs
interface TabsContextType {
  value?: string
  onValueChange?: (value: string) => void
}

const TabsContext = React.createContext<TabsContextType | undefined>(undefined);

// Export a provider component
const TabsProvider: React.FC<TabsContextType & { children: React.ReactNode }> = ({
  value,
  onValueChange,
  children,
}) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      {children}
    </TabsContext.Provider>
  );
};

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsProvider,
};
