import React from 'react';
export interface AvatarProps {
  name: string;
  src?: string;
  color?: string;
  size?: "small" | "medium" | "large";
  className?: string;
  alt?: string;
}

const Avatar = ({
  name,
  src,
  color,
  size = "medium",
  className = "",
  alt,
}: AvatarProps) => {
  // Size configurations
  const sizeConfig = {
    small: {
      container: "w-6 h-6", // 24px
      text: "text-xs",
      font: "font-medium",
    },
    medium: {
      container: "w-8 h-8", // 32px
      text: "text-sm",
      font: "font-medium",
    },
    large: {
      container: "w-12 h-12", // 48px
      text: "text-lg",
      font: "font-semibold",
    },
  };

  // Generate consistent color based on name if no color provided
  const getAvatarColor = (username: string): string => {
    if (color) return color;

    const colors = [
      "#EF4444", // red-500
      "#3B82F6", // blue-500
      "#10B981", // green-500
      "#F59E0B", // yellow-500
      "#8B5CF6", // purple-500
      "#EC4899", // pink-500
      "#6366F1", // indigo-500
      "#14B8A6", // teal-500
      "#F97316", // orange-500
      "#84CC16", // lime-500
    ];

    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  // Generate initials from name
  const getInitials = (name: string): string => {
    if (!name) return "?";

    const words = name.trim().split(" ");
    if (words.length === 1) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return (words[0][0] + words[words.length - 1][0]).toUpperCase();
  };

  const currentSize = sizeConfig[size];
  const backgroundColor = getAvatarColor(name);
  const initials = getInitials(name);

  return (
    <div
      className={`
        ${currentSize.container}
        rounded-full
        overflow-hidden
        flex
        items-center
        justify-center
        text-white
        ${currentSize.text}
        ${currentSize.font}
        flex-shrink-0
        ${className}
      `}
      style={{ backgroundColor }}
      title={name}
    >
      {src ? (
        <>
          <img
            src={src}
            alt={alt || name}
            className="w-full h-full object-cover"
            onError={(e) => {
              // Hide image on error, showing fallback initials
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
            }}
          />
          {/* Fallback initials (hidden by default, shown when image fails) */}
          <span
            className="absolute inset-0 flex items-center justify-center"
            style={{ display: "none" }}
          >
            {initials}
          </span>
        </>
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

export default Avatar;
