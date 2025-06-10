import StarRating from "./StarRating";

export default function ReviewForm({
  rating,
  setRating,
  feedback,
  setFeedback,
  handleSubmit,
  handleCancel
}) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionBoxRef = useRef(null);

  const suggestions = [
    "Improve explanation of concepts",
    "Provide more practical examples",
    "Share notes after class",
    "Give regular quizzes",
    "Speak slower and more clearly"
  ];

  const handleSuggestionClick = (text) => {
    setFeedback(prev => prev ? prev + ' ' + text : text);
    setShowSuggestions(false);
  };

  return (
    <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="mt-4 relative">
      <div className="flex items-center mb-2">
        <span className="text-yellow-300 mr-2">Rate:</span>
        <StarRating rating={rating} onRate={setRating} />
      </div>

      <div className="relative">
        <textarea
          rows={3}
          className="w-full p-2 rounded bg-transparent border border-yellow-300 text-white placeholder-yellow-300"
          placeholder="Your feedback..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={(e) => {
            if (!e.relatedTarget || !suggestionBoxRef.current?.contains(e.relatedTarget)) {
              setShowSuggestions(false);
            }
          }}
        />

        {showSuggestions && (
          <div
            ref={suggestionBoxRef}
            className="absolute z-10 bg-yellow-100 border border-yellow-300 rounded p-2 mt-1 w-full"
            style={{ top: '100%' }}
          >
            <p className="text-sm font-semibold text-yellow-900">💡 Suggestions:</p>
            <ul className="mt-1 space-y-1">
              {suggestions.map((text, index) => (
                <li
                  key={index}
                  className="text-blue-700 cursor-pointer text-sm hover:underline"
                  onClick={() => handleSuggestionClick(text)}
                  tabIndex={0}
                >
                  {text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex gap-3 mt-3">
        <button
          type="submit"
          className="flex-1 bg-yellow-400 text-indigo-900 py-2 rounded-xl font-bold"
        >
          Submittaa
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="flex-1 bg-gray-600 text-white py-2 rounded-xl"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}