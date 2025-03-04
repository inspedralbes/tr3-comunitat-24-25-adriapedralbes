import { RainbowButton } from "@/components/magicui/rainbow-button";

interface RainbowButtonDemoProps {
  children: React.ReactNode;
}

export function RainbowButtonDemo({ children }: RainbowButtonDemoProps) {
  return (
    <RainbowButton>
      <span className="text-black">{children}</span>
    </RainbowButton>
  );
}
