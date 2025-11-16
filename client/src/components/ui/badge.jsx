import { forwardRef } from 'react';

export const Badge = forwardRef(({ className = '', children, ...props }, ref) => {
  return (
    <span
      ref={ref}
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${className}`}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;

