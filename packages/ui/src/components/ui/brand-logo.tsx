import type { ComponentProps } from "react";
import logoUrl from "../../../public/brand/dojofoo.svg?url";
import { cn } from "../../lib/utils";

type BrandLogoProps = Omit<ComponentProps<"img">, "alt" | "src"> & {
  alt?: string;
};

function BrandLogo({ alt = "dojofoo", className, ...props }: BrandLogoProps) {
  return (
    <img
      alt={alt}
      className={cn(
        "h-6 w-auto [filter:brightness(0)_invert(9%)] dark:[filter:none]",
        className,
      )}
      src={logoUrl}
      {...props}
    />
  );
}

export { BrandLogo };
export type { BrandLogoProps };
