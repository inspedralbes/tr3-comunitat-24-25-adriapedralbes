import { ArrowRightIcon } from "lucide-react";

import { ShimmerButton } from "@/components/magicui/shimmer-button";

export function ShimmerButtonDemo() {
  return (
    <ShimmerButton className="shadow-2xl rounded-full px-4 py-2">
      <span className="text-sm font-medium leading-none tracking-tight text-white">
        ✨ Nuevas Plantillas Gratis
      </span>
      <ArrowRightIcon className="ml-1 size-4 text-white transition-transform duration-300 ease-in-out group-hover:translate-x-0.5" />
    </ShimmerButton>
  );
}
