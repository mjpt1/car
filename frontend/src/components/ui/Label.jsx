'use client';

import React from 'react';

const Label = React.forwardRef(
  ({ className, children, ...props }, ref) => {
    return (
      <label
        className={`block text-sm font-medium text-gray-700 ${className}`}
        ref={ref}
        {...props}
      >
        {children}
      </label>
    );
  }
);
Label.displayName = "Label";

export default Label;
