import type { ComponentProps } from "react";
import logoSvg from "../../../../../assets/brand/dojofoo-flat.svg?raw";
import { cn } from "../../lib/utils";

type BrandLogoProps = Omit<ComponentProps<"span">, "children"> & {
  alt?: string;
};

function BrandLogo({ alt = "dojofoo", className, ...props }: BrandLogoProps) {
  return (
    <span
      aria-label={alt}
      className={cn(
        "inline-block aspect-[3.19/1] h-6 w-[4.785rem] shrink-0 text-neutral-700 [&_path]:!fill-current [&_svg]:block [&_svg]:size-full dark:text-white",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: logoSvg }}
      role="img"
      {...props}
    />
  );
}

export { BrandLogo };
export type { BrandLogoProps };
