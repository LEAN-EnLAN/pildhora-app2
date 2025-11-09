import React from 'react';
import { View, TouchableOpacity, Text, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  shadow?: boolean;
  border?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = "", 
  shadow = true, 
  border = true 
}) => {
  const cardClasses = `bg-white rounded-xl p-4 ${shadow ? 'shadow-sm' : ''} ${border ? 'border border-gray-200' : ''} ${className}`;
  
  return (
    <View className={cardClasses}>
      {children}
    </View>
  );
};