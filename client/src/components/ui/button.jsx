import { forwardRef } from 'react';

const buttonVariants = {
  default: 'bg-primary-green text-white hover:bg-green-700',
  outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
  ghost: 'text-gray-700 hover:bg-gray-100',
};

const buttonSizes = {
  default: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
  sm: 'px-3 py-1.5 text-xs',
};

export const Button = forwardRef(({ 
  children, 
  className = '', 
  variant = 'default', 
  size = 'default',
  ...props 
}, ref) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  const variantStyles = buttonVariants[variant] || buttonVariants.default;
  const sizeStyles = buttonSizes[size] || buttonSizes.default;

  return (
    <button
      ref={ref}
      className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

