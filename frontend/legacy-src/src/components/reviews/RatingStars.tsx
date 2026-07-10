interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: "sm" | "md" | "lg";
}

export default function RatingStars({
  rating,
  maxRating = 5,
  interactive = false,
  onChange,
  size = "md",
}: RatingStarsProps) {
  const sizeClass = size === "sm" ? "text-sm" : size === "lg" ? "text-2xl" : "text-lg";

  const handleClick = (star: number) => {
    if (interactive && onChange) {
      onChange(star);
    }
  };

  return (
    <span className={`inline-flex items-center gap-0.5 ${sizeClass}`}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= Math.round(rating);
        return (
          <button
            key={starValue}
            type="button"
            disabled={!interactive}
            onClick={() => handleClick(starValue)}
            className={`${interactive ? "cursor-pointer hover:scale-110" : "cursor-default"} transition-transform ${
              filled ? "text-yellow-400" : "text-gray-300"
            }`}
          >
            {filled ? "\u2605" : "\u2606"}
          </button>
        );
      })}
    </span>
  );
}
