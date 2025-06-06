import { useState, useEffect } from 'react';
import { collection, doc, getDoc, getDocs, query, where, addDoc } from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { db } from '../../firebaseConfig';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router';
import Swal from 'sweetalert2';

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

export default function StudentDashboard({ studentId }) {
  const [student, setStudent] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const [openReview, setOpenReview] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [ratings, setRatings] = useState({});
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const auth = getAuth();
        const user = auth.currentUser;
        const studentDoc = await getDoc(doc(db, 'users', user.uid));
        if (!studentDoc.exists()) {
          toast.error('Student not found!');
          setLoading(false);
          return;
        }
        const studentData = studentDoc.data();
        console.log(studentData)

        setStudent(studentData);

        if (studentData.teacherId) {
          const teacherDoc = await getDoc(doc(db, 'users', studentData.teacherId));
          if (teacherDoc.exists()) {
            setTeacher(teacherDoc.data());
          }

          const reviewsQuery = query(
            collection(db, 'reviews'),
            where('teacherId', '==', studentData.teacherId)
          );
          const reviewsSnapshot = await getDocs(reviewsQuery);
          const reviewsList = reviewsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date?.toDate?.() || new Date(doc.data().date)
          }));

          reviewsList.sort((a, b) => b.date - a.date);
          setReviews(reviewsList);
        }
        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error('Error loading data.');
        setLoading(false);
      }
    }

    fetchData();
  }, [studentId]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    const rating = ratings[selectedTopic] || 0;
    if (rating === 0 || feedbackText.trim() === '') {
      toast.error('Please provide rating and feedback.');
      return;
    }

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "Do you want to submit this review?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Yes, Submit it!',
      cancelButtonText: 'Cancel',
    })

    if (!result.isConfirmed) {
      return;    //user cancelled
    }

    try {
      const originalReview = reviews.find(r => r.topic === selectedTopic);

      const newReview = {
        teacherId: student.teacherId,
        topic: selectedTopic,
        studentName: student.name,
        surname: student.surname,
        message: feedbackText,
        rating: rating,
        date: originalReview?.date || new Date(), // <-- important change here
      };

      console.log("newReview", newReview)
      await addDoc(collection(db, 'studentreviews'), newReview);

      toast.success('Feedback submitted!');
      setSubmitted(true);
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



  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      localStorage.clear(); // Optional: clear saved role
      toast.success("LogOut Successfull..")
      navigate("/") // or use navigate("/") if using react-router
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("Failed to logout.");
    }
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center space-x-2 text-yellow-400 min-h-screen bg-indigo-900 text-white">
        <svg
          className="animate-spin h-8 w-8 text-yellow-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
        <span className="text-lg font-semibold">Loading data...</span>
      </div>
    );
  }

  if (!student) return <p className="text-red-400">No student data found.</p>;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white">
      <h1 className="text-4xl font-extrabold mb-8 text-center drop-shadow-lg">
        Welcome, <span className="text-yellow-400">{student.name} {student.surname}</span>! 👋
      </h1>

      <section className="bg-white/10 rounded-2xl p-6 max-w-md w-full mb-10 backdrop-blur-md drop-shadow-lg border border-white/30">
        <h2 className="text-xl font-semibold mb-4">Your Profile</h2>
        <ul className="space-y-2 text-yellow-300">
          <li><strong>Course:</strong> {student.course}</li>
          <li><strong>Education:</strong> {student.education}</li>
          <li><strong>City:</strong> {student.city}</li>
        </ul>
      </section>

      <section className="max-w-md w-full space-y-6 mb-10">
        <h2 className="text-2xl font-bold text-yellow-400 mb-4">Teacher Reviews</h2>
        {reviews.length === 0 && (
          <p className="text-yellow-300 font-semibold">No reviews yet.</p>
        )}
        {reviews.map(({ id, topic, rating, date }) => (
          <div
            key={id}
            onClick={() => {
              setSelectedTopic(topic);
              setOpenReview(true);
              setSubmitted(false);
            }}
            className="cursor-pointer bg-white/10 hover:bg-white/20 transition backdrop-blur-md border border-yellow-300 rounded-xl p-4 shadow-lg"
          >
            <p className="text-white text-sm font-semibold mb-1">Topic: <span className="text-yellow-300">{topic}</span></p>
            <p className="text-white text-xs mb-2">{date.toLocaleDateString()}</p>

            {selectedTopic === topic && openReview &&(
              <form onSubmit={handleSubmitReview} className="mt-4 bg-white/10 p-4 rounded-xl border border-yellow-300 space-y-3 shadow-md">
                <h3 className="text-yellow-300 font-bold text-base">Submit Feedback for: <span className="text-white">{selectedTopic}</span></h3>
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
                <textarea
                  rows={3}
                  className="w-full p-2 rounded bg-transparent border border-yellow-300 placeholder-yellow-300 text-white"
                  placeholder="Your feedback..."
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                />
                <div className="flex justify-between gap-3">
                  <button type="submit" className="flex-1 bg-yellow-400 text-indigo-900 font-bold py-2 rounded-xl hover:bg-yellow-500 transition">
                    Submit
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setOpenReview(false);
                      setSelectedTopic('');
                       setFeedbackText('');
                      setRatings((prev) => {
                        const updated = { ...prev };
                        delete updated[selectedTopic];
                        return updated;
                      });
                    }}
                    className="flex-1 bg-gray-600 text-white py-2 rounded-xl hover:bg-gray-700 transition">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        ))
        }
      </section >

      {submitted && (
        <p className="max-w-md w-full text-green-400 font-semibold text-center mt-4">
          Feedback Submitted ✅
        </p>
      )}

      <button
        onClick={handleLogout}
        className="mt-10 bg-red-600 text-white font-bold py-3 px-8 rounded-xl hover:bg-red-700 transition"
      >
        Logout
      </button>

      <ToastContainer position="top-center" autoClose={3000} theme="dark" />
    </div >
  );
}
