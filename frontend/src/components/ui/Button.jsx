'use client';

import React from 'react';

const Button = React.forwardRef(
  ({ children, className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'div' : 'button'; // Simplified asChild logic

    const baseStyles = "inline-flex items-center justify-center rounded-lg text-sm font-semibold ring-offset-background transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50";

    const variants = {
      default: "bg-brand-primary text-white shadow-card hover:bg-brand-primary-dark hover:shadow-card-hover",
      destructive: "bg-status-danger text-white shadow-card hover:bg-status-danger/90",
      outline: "border border-brand-primary text-brand-primary bg-transparent hover:bg-brand-primary/10",
      secondary: "bg-brand-secondary text-white hover:bg-brand-secondary/80",
      ghost: "hover:bg-brand-primary/10 text-brand-primary",
      link: "text-brand-primary underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-11 px-6 py-2",
      sm: "h-9 rounded-md px-4",
      lg: "h-12 rounded-lg px-8 text-base",
      icon: "h-10 w-10",
    };

    return (
      <Comp
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export default Button;
