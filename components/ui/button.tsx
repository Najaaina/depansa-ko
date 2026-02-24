import React from "react";
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
  variant?: "primary" | "secondary" | "outline";
}

export const Button: React.FC<ButtonProps> = ({
  title,
  loading = false,
  variant = "primary",
  disabled,
  className,
  ...props
}) => {
  const isDisabled = disabled || loading;

  const getVariantClasses = () => {
    switch (variant) {
      case "secondary":
        return "bg-green-500";
      case "outline":
        return "bg-transparent border-[1.5px] border-indigo-500";
      default:
        return "bg-indigo-500";
    }
  };

  const getTextClasses = () => {
    switch (variant) {
      case "outline":
        return "text-indigo-500";
      default:
        return "text-white";
    }
  };

  return (
    <TouchableOpacity
      className={`h-12 rounded-xl justify-center items-center my-2 ${getVariantClasses()} ${isDisabled ? "opacity-50" : ""} ${className || ""}`}
      disabled={isDisabled}
      activeOpacity={0.7}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === "outline" ? "#6366F1" : "#FFF"} />
      ) : (
        <Text className={`text-base font-semibold ${getTextClasses()}`}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};
