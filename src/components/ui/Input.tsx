import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';

export interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerClassName,
  className,
  secureTextEntry,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const hasError = !!error;
  const isPassword = secureTextEntry !== undefined;

  return (
    <View className={containerClassName}>
      {label && (
        <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {label}
        </Text>
      )}
      <View
        className={`
          flex-row items-center
          bg-white dark:bg-dark-card
          border-2 rounded-xl
          ${isFocused
            ? 'border-teal-500'
            : hasError
              ? 'border-error'
              : 'border-gray-200 dark:border-gray-700'
          }
        `}
      >
        {leftIcon && (
          <View className="pl-3">
            {leftIcon}
          </View>
        )}
        <TextInput
          className={`
            flex-1 px-4 py-3
            text-base text-gray-900 dark:text-white
            ${leftIcon ? 'pl-2' : ''}
            ${rightIcon || isPassword ? 'pr-2' : ''}
            ${className || ''}
          `}
          placeholderTextColor="#9CA3AF"
          onFocus={(e) => {
            setIsFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            props.onBlur?.(e);
          }}
          secureTextEntry={isPassword && !isPasswordVisible}
          {...props}
        />
        {isPassword && (
          <TouchableOpacity
            className="pr-3"
            onPress={() => setIsPasswordVisible(!isPasswordVisible)}
          >
            <Text className="text-gray-500 text-sm">
              {isPasswordVisible ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        )}
        {rightIcon && !isPassword && (
          <View className="pr-3">
            {rightIcon}
          </View>
        )}
      </View>
      {(error || hint) && (
        <Text
          className={`
            text-sm mt-1.5
            ${hasError ? 'text-error' : 'text-gray-500 dark:text-gray-400'}
          `}
        >
          {error || hint}
        </Text>
      )}
    </View>
  );
}

export default Input;
