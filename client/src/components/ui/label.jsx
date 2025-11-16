import { forwardRef } from 'react';

export const Label = forwardRef(({ className = '', ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={`text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 ${className}`}
      {...props}
    />
  );
});

Label.displayName = 'Label';

export default Label;

