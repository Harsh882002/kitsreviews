import React, { useState } from 'react';
import TeacherForm from './AddTeacher';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [showTeachers, setShowTeachers] = useState(false);

  const navigate = useNavigate();
  // Fetch students reviews
  const fetchStudentReviews = async () => {
    setLoadingStudents(true);
    try {
      const db = getFirestore();
      const reviewsQuery = query(collection(db, 'studentreviews'));
      const reviewSnap = await getDocs(reviewsQuery);
      const reviews = reviewSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log(reviews)
      setStudents(reviews);
    } catch (error) {
      console.error('Error fetching student reviews:', error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return 'Invalid date';
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
    return date.toLocaleString(); // Change toLocaleString() to other format if needed
  };


  // Fetch teachers
  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const db = getFirestore();
      const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
      const querySnapshot = await getDocs(q);
      const teacherList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeachers(teacherList);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className={i < rating ? 'text-yellow-400' : 'text-gray-400'}>★</span>
    ));
  };

  // Handlers for buttons
  const handleShowStudents = () => {
    setShowStudents(true);
    setShowTeachers(false);
    fetchStudentReviews();
  };

  const handleShowTeachers = () => {
    setShowTeachers(true);
    setShowStudents(false);
    fetchTeachers();
  };

  // Logout handler

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

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">

      <div className="absolute top-1/2 left-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-600 rounded-full opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2 animate-spin-slow"></div>

      <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center drop-shadow-lg">
        Welcome, <span className="text-yellow-400">Admin</span>! 🎓
      </h1>

      <div className="bg-white/10 backdrop-blur-md p-4 sm:p-6 rounded-2xl max-w-5xl w-full shadow-lg border border-white/30 space-y-6">

        {/* Buttons */}
        <div className="flex flex-wrap justify-center sm:justify-between gap-3 mb-6">
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-yellow-400 text-indigo-900 font-bold px-4 py-2 rounded-xl hover:bg-yellow-500 transition flex-shrink-0"
          >
            {showForm ? 'Hide Form' : '➕ Add Teacher'}
          </button>

          <button
            onClick={handleShowStudents}
            className={`font-bold px-4 py-2 rounded-xl transition flex-shrink-0 ${showStudents ? 'bg-blue-600 text-white' : 'bg-blue-400 text-white hover:bg-blue-500'
              }`}
          >
            👁️ See Students
          </button>

          <button
            onClick={handleShowTeachers}
            className={`font-bold px-4 py-2 rounded-xl transition flex-shrink-0 ${showTeachers ? 'bg-green-600 text-white' : 'bg-green-400 text-white hover:bg-green-500'
              }`}
          >
            👁️ See Teachers
          </button>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition flex-shrink-0"
          >
            🚪 Logout
          </button>
        </div>

        {showForm && <TeacherForm />}

        {/* Students List */}
        {showStudents && (
          <div className="overflow-x-auto mb-8">
            {loadingStudents ? (
              <p className="text-center text-yellow-300">Loading student reviews...</p>
            ) : students.length === 0 ? (
              <p className="text-center text-yellow-300">No student reviews found.</p>
            ) : (
              <table className="w-full table-auto border-collapse rounded-lg shadow text-sm sm:text-base">
                <thead className="bg-white/10 text-yellow-300">
                  <tr>
                    <th className="p-2 sm:p-3 border border-white/20">Date</th>
                    <th className="p-2 sm:p-3 border border-white/20">Topic</th>
                    <th className="p-2 sm:p-3 border border-white/20">Student Name</th>
                    <th className="p-2 sm:p-3 border border-white/20">Message</th>
                    <th className="p-2 sm:p-3 border border-white/20">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="hover:bg-white/10 transition text-center">
                      <td className="p-2 sm:p-3 border border-white/20 break-words max-w-xs">
                        {formatDate(s.date)}
                      </td>
                       <td className="p-2 sm:p-3 border border-white/20 break-words max-w-xs">{s.topic}</td>
                      <td className="p-2 sm:p-3 border border-white/20">{s.studentName}</td>
                      <td className="p-2 sm:p-3 border border-white/20 break-words max-w-sm">{s.message}</td>
                      <td className="p-2 sm:p-3 border border-white/20 text-yellow-400 text-lg">{renderStars(s.rating)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Teachers List */}
        {showTeachers && (
          <div className="overflow-x-auto mb-8">
            {loadingTeachers ? (
              <p className="text-center text-green-300">Loading teachers...</p>
            ) : teachers.length === 0 ? (
              <p className="text-center text-green-300">No teachers found.</p>
            ) : (
              <table className="w-full table-auto border-collapse rounded-lg shadow text-sm sm:text-base">
                <thead className="bg-green-400 text-gray-900">
                  <tr>
                    <th className="p-2 sm:p-3 border border-gray-300">Name</th>
                    <th className="p-2 sm:p-3 border border-gray-300">Email</th>
                    <th className="p-2 sm:p-3 border border-gray-300">Subject</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((teacher) => (
                    <tr key={teacher.id} className="hover:bg-green-100 transition text-center">
                      <td className="p-2 sm:p-3 border border-gray-300 break-words max-w-xs">{teacher.name || 'N/A'}</td>
                      <td className="p-2 sm:p-3 border border-gray-300 break-words max-w-xs">{teacher.email || 'N/A'}</td>
                      <td className="p-2 sm:p-3 border border-gray-300 break-words max-w-xs">{teacher.subject || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
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
    </div>
  );
};

export default AdminDashboard;
