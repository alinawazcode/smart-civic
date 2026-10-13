import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1E8E6E] focus-visible:ring-offset-2 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none font-control';

  const sizeStyles = {
    sm: 'h-9 px-3 text-xs md:text-sm gap-1.5',
    md: 'min-h-[44px] md:min-h-[40px] px-4 py-2 text-sm gap-2',
    lg: 'min-h-[48px] md:min-h-[44px] px-6 py-2.5 text-base gap-2.5'
  };

  const variantStyles = {
    primary: 'bg-[#1E8E6E] text-white hover:bg-[#166F57] shadow-sm',
    secondary: 'bg-white text-[#14231F] border border-[#E3EAE7] hover:bg-[#F5F8F7] hover:border-[#D1DCD8] shadow-sm',
    ghost: 'bg-transparent text-[#1E8E6E] hover:bg-[#E6F4EF]',
    destructive: 'bg-[#D64545] text-white hover:bg-[#B83232] shadow-sm'
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-4 h-4 animate-spin me-1" />
      ) : (
        leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
    </button>
  );
};
