import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

const EditReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const reviewRef = doc(db, 'studentreviews', id);
        const reviewSnap = await getDoc(reviewRef);
        if (reviewSnap.exists()) {
          const data = reviewSnap.data();
          setTopic(data.topic || '');
          setDate(data.date ? new Date(data.date.seconds * 1000).toISOString().split('T')[0] : '');
        } else {
          toast.error('Review not found');
        }
      } catch (error) {
        console.error('Error fetching review:', error);
        toast.error('Failed to load review');
      }
    };

    fetchReview();
  }, [id]);

 
 
const handleUpdate = async (e) => {
  e.preventDefault();

  const result = await Swal.fire({
    title: 'Update Review?',
    text: 'Are you sure you want to update this review?',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: 'Yes, update it!',
  });

  if (result.isConfirmed) {
    try {
      const reviewRef = doc(db, 'studentreviews', id);
      await updateDoc(reviewRef, {
        topic,
        date: new Date(date),
      });
      toast.success('Review updated successfully!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Update error:', error);
      toast.error('Failed to update review');
    }
  }
};

  return (
    <div className="min-h-screen flex items-center justify-center text-white p-4">
      <form onSubmit={handleUpdate} className="bg-white/10 p-6 rounded-xl w-full max-w-md shadow-lg border border-white/30">
        <h2 className="text-2xl font-bold mb-4 text-yellow-300">Update Review</h2>

        <label className="block mb-2">Topic</label>
        <input
          type="text"
          className="w-full p-2 mb-4 text-white rounded"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          required
        />

        <label className="block mb-2">Date</label>
        <input
          type="date"
          className="w-full p-2 mb-4 text-white rounded"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-indigo-900 font-bold px-4 py-2 rounded w-full">
          Update Review
        </button>
      </form>
    </div>
  );
};

export default EditReview;
