import { useState, useRef } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import StarRating from './StarRating';
import { Link } from 'react-router';

export default function ReviewsSection({ reviews, student, submittedTopics, setSubmittedTopics }) {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [openReview, setOpenReview] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [ratings, setRatings] = useState({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionBoxRef = useRef(null);

const suggestions = [
  "The explanations were clear and easy to understand.",
  "The teacher made the subject interesting and engaging.",
  "I would appreciate more real-world examples.",
  "The lessons were well-structured and organized.",
  "Sometimes the pace was too fast—slowing down would help.",
  "The teacher was approachable and open to questions.",
  "More interactive activities would improve learning.",
  "The feedback on assignments was helpful and detailed.",
  "Providing lecture notes in advance would be useful.",
  "Overall, I enjoyed the class and learned a lot!",
];

  const handleSuggestionClick = (text) => {
    setFeedbackText(prev => prev ? prev + ' ' + text : text);
    setShowSuggestions(false);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const rating = ratings[selectedTopic] || 0;

    if (rating === 0 || feedbackText.trim() === '') {
      toast.error('Please provide both rating and feedback.');
      return;
    }

    const result = await Swal.fire({
      title: 'Submit Review?',
      text: 'Are you sure you want to submit this feedback?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Submit',
      cancelButtonText: 'Cancel',
    });

    if (!result.isConfirmed) return;

    try {
      const review = reviews.find(r => r.topic === selectedTopic);
      const newReview = {
        teacherId: student.teacherId,
        reviewId: review.id,
        topic: selectedTopic,
        studentName: student.name,
        surname: student.surname,
        message: feedbackText,
        rating,
        date: review?.date || new Date(),
        studentId: student.uid,
      };

      await addDoc(collection(db, 'studentreviews'), newReview);

      toast.success('Feedback submitted successfully!');
      setSubmittedTopics(prev => [...prev, selectedTopic]);
      setOpenReview(false);
      setFeedbackText('');
      setRatings(prev => {
        const updated = { ...prev };
        delete updated[selectedTopic];
        return updated;
      });
      setSelectedTopic('');
    } catch (error) {
      console.error(error);
      toast.error('Failed to submit feedback.');
    }
  };

  return (
    <div className="flex justify-center px-4">
      <section className="w-full max-w-2xl space-y-6">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">Teacher Reviews</h2>

        {reviews.length === 0 && (
          <p className="text-yellow-300 font-semibold text-center">No reviews yet.</p>
        )}

        {reviews.map(({ id, topic, rating, date }) => {
          const alreadySubmitted = submittedTopics.includes(topic);

          return (
            <div
              key={id}
              onClick={() => {
                if (!alreadySubmitted) {
                  setSelectedTopic(topic);
                  setOpenReview(true);
                }
              }}
              className={`cursor-pointer bg-white/10 hover:bg-white/20 transition backdrop-blur-md border ${alreadySubmitted ? 'border-gray-400' : 'border-yellow-300'
                } rounded-xl p-4 shadow-lg`}
            >
              <p className="text-white text-sm font-semibold mb-1">
                Topic: <span className="text-yellow-300">{topic}</span>
              </p>
              <p className="text-white text-xs mb-2">{date.toLocaleDateString()}</p>
              {alreadySubmitted && (
                <div className="relative">
                  <p className="text-green-400 text-sm font-semibold">✅ Feedback already submitted</p>
                  <Link
                    to={`/edit-review/${topic}`}
                    className="absolute top-0 right-5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold py-1 px-2 rounded-md"
                  >
                    ✏️ Edit
                  </Link>
                </div>
              )}

              {selectedTopic === topic && openReview && !alreadySubmitted && (
                <div onClick={(e) => e.stopPropagation()}>
                  <form
                    onSubmit={handleSubmitReview}
                    className="mt-4 bg-white/10 p-4 rounded-xl border border-yellow-300 space-y-3 shadow-md relative"
                  >
                    <h3 className="text-yellow-300 font-bold text-base">
                      Submit Feedback for: <span className="text-white">{selectedTopic}</span>
                    </h3>

                    <div className="flex items-center space-x-3">
                      <span className="text-yellow-300 font-medium">Rate:</span>
                      <StarRating
                        rating={ratings[topic] || 0}
                        onRate={(star) =>
                          setRatings((prev) => ({
                            ...prev,
                            [topic]: star,
                          }))
                        }
                      />
                    </div>

                    <div className="relative">
                      <textarea
                        rows={3}
                        className="w-full p-2 rounded bg-transparent border border-yellow-300 placeholder-yellow-300 text-white"
                        placeholder="Your feedback..."
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
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

                    <div className="flex justify-between gap-3">
                      <button
                        type="submit"
                        className="flex-1 font-bold py-2 rounded-xl transition bg-yellow-400 text-indigo-900 hover:bg-yellow-500"
                      >
                        Submit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setOpenReview(false);
                          setSelectedTopic('');
                          setFeedbackText('');
                          setRatings(prev => {
                            const updated = { ...prev };
                            delete updated[selectedTopic];
                            return updated;
                          });
                        }}
                        className="flex-1 bg-gray-600 text-white py-2 rounded-xl hover:bg-gray-700 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          );
        })}
      </section>
    </div>
  );
}