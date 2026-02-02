import React, { useState, forwardRef } from 'react';
import {
  View,
  TextInput,
  Text,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';

export interface InputLightProps extends TextInputProps {
  label?: string;
  error?: string;
  hint?: string;
  containerClassName?: string;
}

export const InputLight = forwardRef<TextInput, InputLightProps>(
  (
    {
      label,
      error,
      hint,
      containerClassName,
      className,
      secureTextEntry,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const hasError = !!error;
    const isPassword = secureTextEntry !== undefined;

    return (
      <View className={containerClassName}>
        {label && (
          <Text className="text-sm font-medium text-white/80 mb-1.5">
            {label}
          </Text>
        )}
        <View
          className={`
            flex-row items-center
            bg-white/10
            border-2 rounded-xl
            ${isFocused
              ? 'border-white'
              : hasError
                ? 'border-red-300'
                : 'border-white/30'
            }
          `}
        >
          <TextInput
            ref={ref}
            className={`
              flex-1 px-4 py-3.5
              text-base text-white font-medium
              ${isPassword ? 'pr-2' : ''}
              ${className || ''}
            `}
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
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
              className="pr-4"
              onPress={() => setIsPasswordVisible(!isPasswordVisible)}
            >
              <Text className="text-white/70 text-sm font-medium">
                {isPasswordVisible ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {(error || hint) && (
          <Text
            className={`
              text-sm mt-1.5
              ${hasError ? 'text-red-200' : 'text-white/60'}
            `}
          >
            {error || hint}
          </Text>
        )}
      </View>
    );
  }
);

InputLight.displayName = 'InputLight';

export default InputLight;
