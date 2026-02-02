import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

export interface ChipOption<T> {
  value: T;
  label: string;
}

export interface ChipSelectorProps<T> {
  options: ChipOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  variant?: 'light' | 'default';
  scrollable?: boolean;
}

export function ChipSelector<T extends string | number>({
  options,
  value,
  onChange,
  variant = 'default',
  scrollable = false,
}: ChipSelectorProps<T>) {
  const isLight = variant === 'light';

  const renderChips = () => (
    <View className={`flex-row flex-wrap ${scrollable ? '' : 'gap-2'}`}>
      {options.map((option, index) => {
        const isSelected = value === option.value;

        return (
          <TouchableOpacity
            key={String(option.value)}
            className={`px-4 py-2.5 rounded-full border-2 ${scrollable ? 'mr-2' : ''} ${
              isLight
                ? isSelected
                  ? 'bg-white border-white'
                  : 'bg-transparent border-white/40'
                : isSelected
                  ? 'bg-teal-500 border-teal-500'
                  : 'bg-white dark:bg-dark-card border-gray-200 dark:border-gray-700'
            }`}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}
          >
            <Text
              className={`font-semibold text-base ${
                isLight
                  ? isSelected
                    ? 'text-teal-600'
                    : 'text-white'
                  : isSelected
                    ? 'text-white'
                    : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );

  if (scrollable) {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
      >
        {renderChips()}
      </ScrollView>
    );
  }

  return renderChips();
}

export default ChipSelector;
