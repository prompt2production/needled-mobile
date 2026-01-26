import React from 'react';
import { View, ViewProps, Pressable, PressableProps } from 'react-native';

export interface CardProps extends ViewProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export interface PressableCardProps extends PressableProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outline';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const variantStyles = {
  default: 'bg-white dark:bg-dark-card',
  elevated: 'bg-white dark:bg-dark-card shadow-md',
  outline: 'bg-white dark:bg-dark-card border border-gray-200 dark:border-gray-700',
};

const paddingStyles = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  children,
  variant = 'elevated',
  padding = 'md',
  className,
  ...props
}: CardProps) {
  return (
    <View
      className={`
        rounded-2xl
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </View>
  );
}

export function PressableCard({
  children,
  variant = 'elevated',
  padding = 'md',
  className,
  ...props
}: PressableCardProps) {
  return (
    <Pressable
      className={`
        rounded-2xl
        ${variantStyles[variant]}
        ${paddingStyles[padding]}
        ${className || ''}
      `}
      {...props}
    >
      {children}
    </Pressable>
  );
}

// Card sub-components for composition
export function CardHeader({
  children,
  className,
  ...props
}: ViewProps & { children: React.ReactNode }) {
  return (
    <View className={`mb-3 ${className || ''}`} {...props}>
      {children}
    </View>
  );
}

export function CardTitle({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <View className={className}>
      {children}
    </View>
  );
}

export function CardContent({
  children,
  className,
  ...props
}: ViewProps & { children: React.ReactNode }) {
  return (
    <View className={className} {...props}>
      {children}
    </View>
  );
}

export function CardFooter({
  children,
  className,
  ...props
}: ViewProps & { children: React.ReactNode }) {
  return (
    <View className={`mt-3 ${className || ''}`} {...props}>
      {children}
    </View>
  );
}

export default Card;
