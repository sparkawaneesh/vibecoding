import { FC } from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
  showText?: boolean;
}

export const Logo: FC<LogoProps> = ({ 
  size = 'md', 
  variant = 'default',
  showText = true 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <Link href="/" className="flex items-center gap-2">
      <div className={`relative ${sizeClasses[size]}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${sizeClasses[size]}`}
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            className={variant === 'default' ? 'fill-primary' : 'fill-foreground'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            className={variant === 'default' ? 'stroke-primary' : 'stroke-foreground'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            className={variant === 'default' ? 'stroke-primary' : 'stroke-foreground'}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showText && (
        <span className={`font-bold ${textSizeClasses[size]} ${variant === 'default' ? 'text-primary' : 'text-foreground'}`}>
          Vibe Studio
        </span>
      )}
    </Link>
  );
}; 