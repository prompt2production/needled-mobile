import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
  View,
} from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const variantStyles = {
  primary: {
    container: 'bg-teal-500 active:bg-teal-600',
    text: 'text-white',
    spinner: '#ffffff',
  },
  secondary: {
    container: 'bg-gray-100 active:bg-gray-200',
    text: 'text-gray-800',
    spinner: '#374151',
  },
  outline: {
    container: 'bg-transparent border-2 border-teal-500 active:bg-teal-50',
    text: 'text-teal-600',
    spinner: '#0D9488',
  },
  ghost: {
    container: 'bg-transparent active:bg-gray-100',
    text: 'text-teal-600',
    spinner: '#0D9488',
  },
};

const sizeStyles = {
  sm: {
    container: 'px-3 py-2',
    text: 'text-sm',
    iconGap: 'gap-1',
  },
  md: {
    container: 'px-4 py-3',
    text: 'text-base',
    iconGap: 'gap-2',
  },
  lg: {
    container: 'px-6 py-4',
    text: 'text-lg',
    iconGap: 'gap-2',
  },
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`
        rounded-xl items-center justify-center flex-row
        ${sizeStyle.container}
        ${sizeStyle.iconGap}
        ${variantStyle.container}
        ${fullWidth ? 'w-full' : ''}
        ${isDisabled ? 'opacity-50' : ''}
        ${className || ''}
      `}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variantStyle.spinner} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <View>{icon}</View>
          )}
          <Text
            className={`
              font-semibold
              ${sizeStyle.text}
              ${variantStyle.text}
            `}
          >
            {children}
          </Text>
          {icon && iconPosition === 'right' && (
            <View>{icon}</View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

export default Button;
