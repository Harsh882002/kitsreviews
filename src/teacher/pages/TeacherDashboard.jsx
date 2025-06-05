import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, getDoc, addDoc, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import Swal from 'sweetalert2';
import { getAuth, signOut } from 'firebase/auth';
import { toast, ToastContainer } from 'react-toastify';

const TeacherDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [topic, setTopic] = useState('');
  const [date, setDate] = useState('');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null);

  const fetchData = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role === 'teacher') {
            setTeacher({ ...userData, uid: user.uid });
          } else {
            console.warn('Logged in user is not a teacher.');
          }
        } else {
          console.warn('No user document found.');
        }

        const reviewsQuery = query(
          collection(db, 'studentreviews'),
          where('teacherId', '==', user.uid)
        );
        const reviewSnap = await getDocs(reviewsQuery);
        const reviews = reviewSnap.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const dateA = a.date?.seconds || 0;
            const dateB = b.date?.seconds || 0;
            return dateB - dateA; // Sort by date descending
          });

        setStudents(reviews);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return 'Invalid date';
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
    return date.toLocaleDateString();
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-400'}>★</span>
    ));
  };

  const handleAddReview = async (e) => {
    e.preventDefault();

    if (!teacher) {
      alert('Teacher not identified!');
      return;
    }

    try {
      await addDoc(collection(db, 'reviews'), {
        topic,
        date,
        teacherId: teacher.uid,
        createdAt: new Date()
      });

      alert(`Topic "${topic}" on ${date} added successfully!`);
      setShowForm(false);
      setTopic('');
      setDate('');
    } catch (error) {
      console.error('Error adding review:', error);
      alert('Failed to add review');
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      localStorage.clear();
      toast.success("Logout successful...");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout Error:", error);
      toast.error("Failed to logout.");
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Review?',
      text: 'Are you sure you want to delete this review?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#e3342f',
      cancelButtonColor: '#6c757d',
      confirmButtonText: 'Yes, delete it!',
    });

    if (result.isConfirmed) {
      try {
        await deleteDoc(doc(db, "studentreviews", id));
        toast.success("Review deleted");
        fetchData();
      } catch (err) {
        console.error("Delete error:", err);
        toast.error("Failed to delete review");
      }
    }
  };

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative">

      <div className="absolute top-1/2 left-1/2 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-600 rounded-full opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2 animate-spin-slow"></div>

      <div className="absolute top-4 right-4 z-50 sm:static sm:mb-4 sm:flex sm:justify-end">
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold shadow"
        >
          🔒 Logout
        </button>
      </div>

      <div className="max-w-full sm:max-w-3xl md:max-w-4xl mx-auto bg-white/10 backdrop-blur-md p-6 rounded-2xl shadow-lg border border-white/30">

        {loading ? (
          <div className="text-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-300 mx-auto mb-2"></div>
            <p>Loading dashboard...</p>
          </div>
        ) : (
          <>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 text-yellow-300 text-center">
              Welcome, {teacher?.name || 'Teacher'}! 👨‍🏫
            </h1>
            <p className="text-center mb-6 text-sm sm:text-base">
              Subject: {teacher?.subject || 'N/A'} | Email: {teacher?.email || 'N/A'}
            </p>

            <div className="flex justify-center mb-4">
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-yellow-400 text-indigo-900 font-bold px-6 py-2 rounded-xl hover:bg-yellow-500 transition"
              >
                {showForm ? 'Cancel' : '➕ Add Review'}
              </button>
            </div>

            {showForm && (
              <form onSubmit={handleAddReview} className="space-y-4 bg-white/10 p-4 rounded-xl border border-white/20">
                <div>
                  <label className="block mb-1 font-semibold text-yellow-200">Topic</label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full p-2 rounded text-black"
                    placeholder="Enter topic"
                    required
                  />
                </div>
                <div>
                  <label className="block mb-1 font-semibold text-yellow-200">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 rounded text-black"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full sm:w-auto"
                >
                  Add
                </button>
              </form>
            )}

            <h2 className="text-xl sm:text-2xl font-bold mt-8 mb-4 text-yellow-300 text-center">📚 Student Reviews</h2>

            {students.length === 0 ? (
              <p className="text-center text-lg text-gray-200 py-4">No reviews yet 📭</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-white border-collapse min-w-[600px]">
                  <thead>
                    <tr className="bg-white/10">
                      <th className="p-2 border border-white/20 text-left">Date</th>
                      <th className="p-2 border border-white/20 text-left">Topic</th>
                      <th className="p-2 border border-white/20 text-left">Student Name</th>
                      <th className="p-2 border border-white/20 text-left">Review</th>
                      <th className="p-2 border border-white/20 text-center">Stars</th>
                      <th className="p-2 border border-white/20 text-center">Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s) => (
                      <tr key={s.id} className="hover:bg-white/10 transition">
                        <td className="p-2 sm:p-3 border border-white/20 break-words max-w-xs">
                          {formatDate(s.date)}
                        </td>
                        <td className="p-2 border border-white/20">{s.topic}</td>
                        <td className="p-2 border border-white/20">{s.studentName} {s.surname}</td>
                        <td className="p-2 border border-white/20">{s.message}</td>
                        <td className="p-2 border border-white/20 text-yellow-400 text-lg text-center">{renderStars(s.rating)}</td>
                        <td className="text-center">
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-1 rounded-md shadow transition duration-300 ease-in-out"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        .animate-spin-slow {
          animation: spin 120s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>

      <ToastContainer />
    </div>
  );
};

export default TeacherDashboard;
