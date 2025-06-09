// EditReviewForm.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { doc, updateDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { toast } from 'react-toastify';
import StarRating from './StarRating';

export default function EditReviewForm() {
  const { topic } = useParams();
  const navigate = useNavigate();
  const [reviewData, setReviewData] = useState(null);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const q = query(collection(db, 'studentreviews'), where('topic', '==', topic));
        const snapshot = await getDocs(q);
        const docData = snapshot.docs[0];
        if (docData) {
          const data = docData.data();
          setReviewData({ id: docData.id, ...data });
          setRating(data.rating);
          setMessage(data.message);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch review data.');
      }
    };
    fetchReview();
  }, [topic]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (rating === 0 || message.trim() === '') {
      toast.error('Please provide both rating and feedback.');
      return;
    }

    try {
      const reviewRef = doc(db, 'studentreviews', reviewData.id);
      await updateDoc(reviewRef, {
        rating,
        message,
      });
      toast.success('Review updated successfully!');
      navigate('/'); // Go back to reviews page
    } catch (error) {
      console.error(error);
      toast.error('Failed to update review.');
    }
  };

  if (!reviewData) return <p className="text-center text-yellow-300">Loading...</p>;

  return (
    <div className="flex justify-center px-4 mt-10">
      <form
        onSubmit={handleUpdate}
        className="w-full max-w-xl bg-white/10 p-6 rounded-xl border border-yellow-300 shadow-md space-y-4"
      >
        <h2 className="text-yellow-400 text-2xl font-bold text-center">Edit Feedback</h2>

        <p className="text-white font-semibold text-center">
          Topic: <span className="text-yellow-300">{topic}</span>
        </p>

        <div className="flex items-center space-x-3">
          <span className="text-yellow-300 font-medium">Rate:</span>
          <StarRating rating={rating} onRate={(star) => setRating(star)} />
        </div>

        <textarea
          rows={4}
          className="w-full p-2 rounded bg-transparent border border-yellow-300 placeholder-yellow-300 text-white"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />

        <div className="flex justify-between gap-3">
          <button
            type="submit"
            className="flex-1 font-bold py-2 rounded-xl transition bg-yellow-400 text-indigo-900 hover:bg-yellow-500"
          >
            Update
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-600 text-white py-2 rounded-xl hover:bg-gray-700 transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
