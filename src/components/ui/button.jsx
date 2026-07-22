import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-amber-600 text-white shadow hover:bg-amber-700 focus-visible:ring-amber-500",
        destructive: "bg-red-600 text-white shadow-sm hover:bg-red-700",
        outline: "border border-zinc-700 bg-transparent text-zinc-200 shadow-sm hover:bg-zinc-800 hover:text-white",
        secondary: "bg-zinc-800 text-zinc-100 shadow-sm hover:bg-zinc-700",
        ghost: "text-zinc-400 hover:bg-zinc-800 hover:text-white",
        link: "text-amber-500 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-6 py-2 rounded-lg text-sm",
        sm: "h-9 rounded-md px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  );
});
Button.displayName = "Button";

export { Button, buttonVariants };
