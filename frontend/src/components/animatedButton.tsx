// animatedButton.tsx
import { AnimatedShinyText } from "@/components/magicui/animated-shiny-text";
import { ShineBorder } from "@/components/magicui/shine-border";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps {
  children: React.ReactNode;
}

export function AnimatedButton({ children }: AnimatedButtonProps) {
  return (
    <div className="flex items-center justify-center my-2">
      <ShineBorder
        borderRadius={9999}
        borderWidth={2}
        duration={60}
        color={["rgba(139, 92, 246, 1)", "#8B5CF6aa", "rgba(139, 92, 246, 1)"]}
        className={cn(
          "group min-h-0 min-w-0 rounded-full border border-white/5 bg-black text-xs transition-all ease-in hover:cursor-pointer hover:bg-neutral-900 px-4 py-2",
          "dark:bg-black dark:hover:bg-neutral-900",
        )}
      >
        <AnimatedShinyText className="inline-flex items-center justify-center transition ease-out hover:duration-300">
          <span className="text-white font-bold">{children}</span>
        </AnimatedShinyText>
      </ShineBorder>
    </div>
  );
}
