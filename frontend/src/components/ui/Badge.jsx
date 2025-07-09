'use client';

import React from 'react';

const badgeVariants = {
  default: "border-transparent bg-brand-primary text-primary-foreground hover:bg-brand-primary/80",
  secondary: "border-transparent bg-brand-secondary text-secondary-foreground hover:bg-brand-secondary/80",
  destructive: "border-transparent bg-red-500 text-destructive-foreground hover:bg-red-500/80",
  success: "border-transparent bg-green-500 text-white hover:bg-green-500/80",
  warning: "border-transparent bg-yellow-500 text-black hover:bg-yellow-500/80",
  outline: "text-foreground", // Simple outline, relies on text color
};

function Badge({
  className,
  variant = 'default', // default, secondary, destructive, outline, success, warning
  children,
  ...props
}) {
  return (
    <div
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${badgeVariants[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export { Badge, badgeVariants };
