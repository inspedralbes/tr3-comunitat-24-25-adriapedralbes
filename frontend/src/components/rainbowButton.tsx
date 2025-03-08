import { RainbowButton } from "@/components/magicui/rainbow-button";

interface RainbowButtonDemoProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function RainbowButtonDemo({ children, ...props }: RainbowButtonDemoProps) {
  return (
    <RainbowButton {...props}>
      <span className="text-black">{children}</span>
    </RainbowButton>
  );
}
