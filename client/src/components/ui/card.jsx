import { forwardRef } from 'react';

export const Card = forwardRef(({ className = '', children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`bg-white rounded-lg shadow-md ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = 'Card';

export default Card;

