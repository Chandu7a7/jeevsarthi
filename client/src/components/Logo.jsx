import { Link } from 'react-router-dom';

export function Logo({ size = 'default' }) {
  const sizeStyles = {
    small: 'text-lg',
    default: 'text-2xl',
    large: 'text-3xl font-bold',
  };

  const textSize = sizeStyles[size] || sizeStyles.default;

  return (
    <Link to="/" className="flex items-center">
      <span className={`${textSize} text-primary-green font-bold`}>
        JeevSarthi
      </span>
    </Link>
  );
}

export default Logo;

