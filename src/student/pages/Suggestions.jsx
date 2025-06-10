import React, { useState } from 'react';

export default function FeedbackForm() {
  const [feedback, setFeedback] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const suggestions = [
    "Improve explanation of concepts",
    "Provide more practical examples",
    "Share notes after class",
    "Give regular quizzes",
    "Speak slower and more clearly",
  ];

  const handleSuggestionClick = (suggestion) => {
    setFeedback(prev => prev ? prev + ' ' + suggestion : suggestion);
    setShowSuggestions(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold mb-3">📋 Student Feedback</h2>

      <textarea
        className="w-full border border-gray-400 rounded p-2"
        placeholder="Write your feedback..."
        rows={4}
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        onFocus={() => setShowSuggestions(true)} // Show on click/focus
      />

      {showSuggestions && (
        <div className="bg-gray-100 border border-gray-300 rounded p-2 mt-2">
          <p className="text-sm font-semibold text-gray-700">💡 Suggestions:</p>
          <ul className="mt-1 space-y-1">
            {suggestions.map((text, idx) => (
              <li
                key={idx}
                className="text-blue-600 cursor-pointer hover:underline text-sm"
                onClick={() => handleSuggestionClick(text)}
              >
                {text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
