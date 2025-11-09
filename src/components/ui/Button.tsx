import React from 'react';
import { TouchableOpacity, Text, TextStyle } from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  onPress, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = "" 
}) => {
  const baseClasses = "font-semibold";
  const variantClasses = {
    primary: "bg-blue-500 text-white",
    secondary: "bg-gray-800 text-white shadow-sm", 
    danger: "bg-red-500 text-white"
  };
  const sizeClasses = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg"
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50' : ''} ${className}`}
    >
      {children}
    </TouchableOpacity>
  );
};