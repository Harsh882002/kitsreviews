import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { doc, updateDoc, getDocs, collection, query, where, getDoc } from 'firebase/firestore';
import { db, auth } from '../../firebaseConfig';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';
import StarRating from './StarRating';

export default function EditReviewForm() {
  const { topic } = useParams();
  const navigate = useNavigate();
  const [reviewData, setReviewData] = useState(null);
  const [rating, setRating] = useState(0);
  const [message, setMessage] = useState('');
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setUser(user);
        // Fetch user role
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role);
            fetchReview(user.uid, userDoc.data().role);
          } else {
            toast.error('User profile not found');
            navigate('/');
          }
        } catch (err) {
          console.error('Role fetch error:', err);
          toast.error('Failed to verify user role');
          navigate('/');
        }
      } else {
        setUser(null);
        setLoading(false);
        toast.error('Please sign in to edit reviews');
        navigate('/login');
      }
    });
    return () => unsubscribe();
  }, [topic, navigate]);

  const fetchReview = async (userId, role) => {
    try {
      let q;
      if (role === 'student') {
        q = query(
          collection(db, 'studentreviews'),
          where('topic', '==', topic),
          where('studentId', '==', userId)
        );
      } else if (role === 'teacher' || role === 'admin') {
        q = query(
          collection(db, 'studentreviews'),
          where('topic', '==', topic)
        );
      } else {
        toast.error('Unauthorized access');
        navigate('/');
        return;
      }

      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        toast.error('No review found');
        navigate('/');
        return;
      }

      const docData = snapshot.docs[0];
      const data = docData.data();
      setReviewData({ id: docData.id, ...data });
      setRating(data.rating);
      setMessage(data.message);
    } catch (err) {
      console.error('Fetch error:', err);
      toast.error(`Failed to load review: ${err.message}`);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    
    if (!user || !userRole) {
      toast.error('Authentication required');
      return;
    }

    if (rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (message.trim() === '') {
      toast.error('Please write your feedback');
      return;
    }

    try {
      // Verify ownership before update
      if (userRole === 'student') {
        const reviewDoc = await getDoc(doc(db, 'studentreviews', reviewData.id));
        if (reviewDoc.data().studentId !== user.uid) {
          toast.error('You can only edit your own reviews');
          return;
        }
      }

      await updateDoc(doc(db, 'studentreviews', reviewData.id), {
        rating,
        message,
        updatedAt: new Date()
      });
      
      toast.success('Review updated successfully!');
      navigate('/');
    } catch (error) {
      console.error('Update error:', error);
      toast.error(`Update failed: ${error.message}`);
    }
  };

  if (loading) {
    return <div className="text-center text-yellow-300 py-10">Loading review data...</div>;
  }

  if (!reviewData) {
    return <div className="text-center text-red-500 py-10">No review data available</div>;
  }

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
          <span className="text-yellow-300 font-medium">Rating:</span>
          <StarRating 
            rating={rating} 
            onRate={(star) => setRating(star)} 
            editable={true}
          />
          <span className="text-yellow-300">{rating}/5</span>
        </div>

        <div className="space-y-1">
          <label className="text-yellow-300 font-medium">Your Feedback:</label>
          <textarea
            rows={4}
            className="w-full p-2 rounded bg-transparent border border-yellow-300 placeholder-yellow-300/50 text-white focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Share your detailed feedback..."
          />
        </div>

        <div className="flex justify-between gap-3 pt-4">
          <button
            type="submit"
            className="flex-1 font-bold py-2 rounded-xl transition bg-yellow-400 text-indigo-900 hover:bg-yellow-500 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Review'}
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