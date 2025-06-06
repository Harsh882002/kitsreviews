import { useState } from 'react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import ReviewForm from './ReviewForm';

export default function ReviewItem({ review, student, submittedTopics, setSubmittedTopics }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async () => {
    if (!rating || !feedback.trim()) {
      toast.error('Please provide rating and feedback.');
      return;
    }

    const result = await Swal.fire({
      title: 'Submit review?',
      showCancelButton: true,
      confirmButtonText: 'Yes',
    });

    if (!result.isConfirmed) return;

    try {
      const newReview = {
        teacherId: student.teacherId,
        topic: review.topic,
        studentName: student.name,
        surname: student.surname,
        message: feedback,
        rating,
        date: review.date,
        studentId: student.uid,
      };

      await addDoc(collection(db, 'studentreviews'), newReview);
      toast.success('Feedback submitted!');
      setSubmittedTopics(prev => [...prev, review.topic]);
      setOpen(false);
      setFeedback('');
      setRating(0);
    } catch {
      toast.error('Failed to submit feedback.');
    }
  };

  const isSubmitted = submittedTopics.includes(review.topic);

  return (
    <div
      className={`p-4 rounded-xl shadow-md backdrop-blur-md border cursor-pointer ${
        isSubmitted ? 'border-gray-400' : 'border-yellow-300'
      } bg-white/10`}
      onClick={() => !isSubmitted && setOpen(!open)}
    >
      <p className="text-yellow-300 font-semibold">Topic: {review.topic}</p>
      <p className="text-white text-xs">{review.date.toLocaleDateString()}</p>
      {isSubmitted && <p className="text-green-400 mt-2">✅ Feedback submitted</p>}
      {open && !isSubmitted && (
        <ReviewForm
          rating={rating}
          setRating={setRating}
          feedback={feedback}
          setFeedback={setFeedback}
          handleSubmit={handleSubmit}
          handleCancel={() => setOpen(false)}
        />
      )}
    </div>
  );
}
