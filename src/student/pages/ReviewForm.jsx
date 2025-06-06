import StarRating from './StarRating';

export default function ReviewForm({ rating, setRating, feedback, setFeedback, handleSubmit, handleCancel }) {
  return (
    <form onSubmit={e => { e.preventDefault(); handleSubmit(); }} className="mt-4">
      <div className="flex items-center mb-2">
        <span className="text-yellow-300 mr-2">Rate:</span>
        <StarRating rating={rating} onRate={setRating} />
      </div>
      <textarea
        rows={3}
        className="w-full p-2 rounded bg-transparent border border-yellow-300 text-white placeholder-yellow-300"
        placeholder="Your feedback..."
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
      <div className="flex gap-3 mt-3">
        <button type="submit" className="flex-1 bg-yellow-400 text-indigo-900 py-2 rounded-xl font-bold">
          Submit
        </button>
        <button type="button" onClick={handleCancel} className="flex-1 bg-gray-600 text-white py-2 rounded-xl">
          Cancel
        </button>
      </div>
    </form>
  );
}
