import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

export interface TextProps extends RNTextProps {
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'bodySmall' | 'caption' | 'label';
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'primary' | 'error' | 'success';
}

const variantStyles = {
  h1: 'text-3xl',
  h2: 'text-2xl',
  h3: 'text-xl',
  body: 'text-base',
  bodySmall: 'text-sm',
  caption: 'text-xs',
  label: 'text-sm',
};

const weightStyles = {
  normal: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

const colorStyles = {
  default: 'text-gray-900 dark:text-white',
  muted: 'text-gray-500 dark:text-gray-400',
  primary: 'text-teal-600 dark:text-teal-400',
  error: 'text-error',
  success: 'text-success',
};

export function Heading1({ children, className, ...props }: TextProps) {
  return (
    <RNText
      className={`text-3xl font-bold text-gray-900 dark:text-white ${className || ''}`}
      {...props}
    >
      {children}
    </RNText>
  );
}

export function Heading2({ children, className, ...props }: TextProps) {
  return (
    <RNText
      className={`text-2xl font-bold text-gray-900 dark:text-white ${className || ''}`}
      {...props}
    >
      {children}
    </RNText>
  );
}

export function Heading3({ children, className, ...props }: TextProps) {
  return (
    <RNText
      className={`text-xl font-semibold text-gray-900 dark:text-white ${className || ''}`}
      {...props}
    >
      {children}
    </RNText>
  );
}

export function BodyText({ children, className, ...props }: TextProps) {
  return (
    <RNText
      className={`text-base text-gray-700 dark:text-gray-300 ${className || ''}`}
      {...props}
    >
      {children}
    </RNText>
  );
}

export function SmallText({ children, className, ...props }: TextProps) {
  return (
    <RNText
      className={`text-sm text-gray-600 dark:text-gray-400 ${className || ''}`}
      {...props}
    >
      {children}
    </RNText>
  );
}

export function Caption({ children, className, ...props }: TextProps) {
  return (
    <RNText
      className={`text-xs text-gray-500 dark:text-gray-500 ${className || ''}`}
      {...props}
    >
      {children}
    </RNText>
  );
}

export function Label({ children, className, ...props }: TextProps) {
  return (
    <RNText
      className={`text-sm font-medium text-gray-700 dark:text-gray-300 ${className || ''}`}
      {...props}
    >
      {children}
    </RNText>
  );
}

// Generic Text component with all options
export function AppText({
  children,
  variant = 'body',
  weight = 'normal',
  color = 'default',
  className,
  ...props
}: TextProps) {
  return (
    <RNText
      className={`
        ${variantStyles[variant]}
        ${weightStyles[weight]}
        ${colorStyles[color]}
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </RNText>
  );
}

export default AppText;
