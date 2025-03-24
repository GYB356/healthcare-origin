import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "medium" | "large";
  color?: string;
  text?: string;
  fullScreen?: boolean;
}

/**
 * A reusable loading spinner component that can be used throughout the application
 */
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  color = "blue",
  text = "Loading...",
  fullScreen = false,
}) => {
  const sizeMap = {
    small: {
      wrapper: "w-6 h-6",
      spinner: "w-4 h-4 border-2",
    },
    medium: {
      wrapper: "w-12 h-12",
      spinner: "w-8 h-8 border-3",
    },
    large: {
      wrapper: "w-20 h-20",
      spinner: "w-16 h-16 border-4",
    },
  };

  const containerClasses = fullScreen
    ? "fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50"
    : "flex items-center justify-center";

  return (
    <div className={containerClasses} data-testid="loading-spinner">
      <div className="flex flex-col items-center">
        <div className={`${sizeMap[size].wrapper} relative`}>
          <div
            className={`${sizeMap[size].spinner} border-gray-200 border-solid rounded-full animate-spin`}
            style={{ borderTopColor: color }}
          />
        </div>
        {text && <p className="mt-2 text-gray-600">{text}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner;
