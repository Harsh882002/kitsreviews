function StarRating({ rating, onRate }) {
  return (
    <div className="flex space-x-1 sm:space-x-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= rating;
        return (
          <button
            key={star}
            onClick={() => onRate(star)}
            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
            className="focus:outline-none transform transition-transform hover:scale-125 active:scale-95"
            type="button"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill={isFilled ? '#fbbf24' : 'none'}
              stroke={isFilled ? '#f59e0b' : '#9ca3af'}
              strokeWidth="2.5"
              viewBox="0 0 24 24"
              className="w-8 h-8 sm:w-10 sm:h-10 drop-shadow-md"
            >
              <path 
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
              />
            </svg>
          </button>
        );
      })}
    </div>
  );
}
export default StarRating;