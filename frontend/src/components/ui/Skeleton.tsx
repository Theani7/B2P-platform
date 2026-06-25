interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

const variantStyles = {
  text: "h-4 w-full rounded",
  circular: "rounded-full",
  rectangular: "",
};

export default function Skeleton({
  className = "",
  variant = "text",
  width,
  height,
}: SkeletonProps) {
  return (
    <div
      className={`animate-pulse bg-gray-200 ${variantStyles[variant]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
