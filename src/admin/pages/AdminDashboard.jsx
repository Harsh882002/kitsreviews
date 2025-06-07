import React, { useState } from 'react';
import TeacherForm from './AddTeacher';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router';

const AdminDashboard = () => {
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [loadingTeachers, setLoadingTeachers] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showStudents, setShowStudents] = useState(false);
  const [showTeachers, setShowTeachers] = useState(false);
  const [studentReviews, setStudentReviews] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [teacherStudents, setTeacherStudents] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const navigate = useNavigate();

console.log("students", students)

  const fetchStudentsData = async () => {
    setLoadingStudents(true);
    try {
      const db = getFirestore();
      const studentQuery = query(collection(db, 'users'), where('role', '==', 'student'));
      const snap = await getDocs(studentQuery);
      const studentList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudents(studentList);
      setStudentReviews([]);
      setSelectedStudent(null);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error("Failed to fetch students");
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchStudentReviews = async (studentName) => {
    setLoadingStudents(true);
    try {
      const db = getFirestore();
      const reviewsQuery = query(collection(db, 'studentreviews'), where('studentName', '==', studentName));
      const snap = await getDocs(reviewsQuery);
      const reviews = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const sorted = reviews.sort((a, b) => (b.date?.seconds || 0) - (a.date?.seconds || 0));
      setStudentReviews(sorted);
      setSelectedStudent(studentName);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error("Failed to fetch reviews");
    } finally {
      setLoadingStudents(false);
    }
  };

  const fetchTeachers = async () => {
    setLoadingTeachers(true);
    try {
      const db = getFirestore();
      const q = query(collection(db, 'users'), where('role', '==', 'teacher'));
      const snap = await getDocs(q);
      const teacherList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeachers(teacherList);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoadingTeachers(false);
    }
  };

  const fetchStudentsOfTeacher = async (teacherUid) => {
    setLoadingTeachers(true);
    try {
      const db = getFirestore();
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'student'),
        where('teacherId', '==', teacherUid)
      );
      const snap = await getDocs(q);
      const studentList = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTeacherStudents(studentList);
      setSelectedTeacher(teacherUid);
      setShowTeachers(false); // Hide teacher table
    } catch (error) {
      console.error('Error fetching teacher students:', error);
      toast.error('Failed to fetch teacher’s students');
    } finally {
      setLoadingTeachers(false);
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      localStorage.clear();
      toast.success('Logout successful');
      navigate('/');
    } catch (error) {
      console.error('Logout Error:', error);
      toast.error('Logout failed');
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp?.seconds) return 'Invalid date';
    const date = new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1e6);
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-10 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-600 rounded-full opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2 animate-spin-slow"></div>

      <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center drop-shadow-lg">
        Welcome, <span className="text-yellow-400">Admin</span>! 🎓
      </h1>

      <div className="bg-white/10 backdrop-blur-md p-4 sm:p-6 rounded-2xl max-w-5xl w-full shadow-lg border border-white/30 space-y-6">
        <div className="flex flex-wrap justify-center sm:justify-between gap-3 mb-6">
          <button onClick={() => setShowForm(!showForm)} className="bg-yellow-400 text-indigo-900 font-bold px-4 py-2 rounded-xl hover:bg-yellow-500 transition">
            {showForm ? 'Hide Form' : '➕ Add Mentor'}
          </button>

          <button onClick={() => {
            setShowStudents(true);
            setShowTeachers(false);
            setTeacherStudents([]);
            fetchStudentsData();
          }} className={`font-bold px-4 py-2 rounded-xl transition ${showStudents ? 'bg-blue-600' : 'bg-blue-400 hover:bg-blue-500'} text-white`}>
            👁️ See Students
          </button>

          <button onClick={() => {
            setShowTeachers(true);
            setShowStudents(false);
            setStudentReviews([]);
            fetchTeachers();
          }} className={`font-bold px-4 py-2 rounded-xl transition ${showTeachers ? 'bg-green-600' : 'bg-green-400 hover:bg-green-500'} text-white`}>
            👁️ See Mentors
          </button>

          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-2 rounded-xl transition">
            🚪 Logout
          </button>
        </div>

        {showForm && <TeacherForm />}

        {/* Show Student List */}
        {showStudents && students.length > 0 && studentReviews.length === 0 && (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse shadow text-sm sm:text-base">
              <thead className="bg-white/10 text-yellow-300">
                <tr>
                  <th className="p-3 border border-white/20">Name</th>
                  <th className="p-3 border border-white/20">Email</th>
                  {/* <th className="p-3 border border-white/20">Mentor</th> */}

                  <th className="p-3 border border-white/20">Action</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-white/10 text-center transition">
                    <td className="p-3 border border-white/20">{s.name} {s.surname}</td>
                    <td className="p-3 border border-white/20">{s.email}</td>

                    <td className="p-3 border border-white/20">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded"
                        onClick={() => fetchStudentReviews(s.name)}
                      >
                        See Review
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Show Student Reviews */}
        {studentReviews.length > 0 && (
          <div className="space-y-4">
            <button onClick={() => {
              setStudentReviews([]);
              setSelectedStudent(null);
            }} className="bg-gray-300 hover:bg-gray-400 text-black font-semibold px-4 py-2 rounded">
              🔙 Back to Students
            </button>
            <h2 className="text-xl text-yellow-300 font-bold mb-2">
              Reviews for: {selectedStudent}
            </h2>
            <table className="w-full table-auto border-collapse shadow text-sm sm:text-base">
              <thead className="bg-white/10 text-yellow-300">
                <tr>
                  <th className="p-3 border border-white/20">Date</th>
                  <th className="p-3 border border-white/20">Topic</th>
                  <th className="p-3 border border-white/20">Message</th>
                  <th className="p-3 border border-white/20">Rating</th>
                </tr>
              </thead>
              <tbody>
                {studentReviews.map((r) => (
                  <tr key={r.id} className="hover:bg-white/10 text-center transition">
                    <td className="p-3 border border-white/20">{formatDate(r.date)}</td>
                    <td className="p-3 border border-white/20">{r.topic}</td>
                    <td className="p-3 border border-white/20">{r.message}</td>
                    <td className="p-3 border border-white/20 text-yellow-400 text-lg">
                      {[...Array(5)].map((_, i) => (
                        <span key={i}>{i < r.rating ? '★' : '☆'}</span>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Show Teachers */}
        {showTeachers && teachers.length > 0 && teacherStudents.length === 0 && (
          <div className="overflow-x-auto">
            <table className="w-full table-auto border-collapse shadow text-sm sm:text-base">
              <thead className="bg-green-400 text-gray-900">
                <tr>
                  <th className="p-3 border border-gray-300">Name</th>
                  <th className="p-3 border border-gray-300">Email</th>
                  <th className="p-3 border border-gray-300">Subject</th>
                  <th className="p-3 border border-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((t) => (
                  <tr key={t.id} className="hover:bg-green-100 text-center transition">
                    <td className="p-3 border border-gray-300">{t.name} {t.surname}</td>
                    <td className="p-3 border border-gray-300">{t.email}</td>
                    <td className="p-3 border border-gray-300">{t.subject}</td>
                    <td className="p-3 border border-gray-300">
                      <button
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                        onClick={() => fetchStudentsOfTeacher(t.id)}
                      >
                        👁️ See Students
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Show Students of Selected Teacher */}
        {teacherStudents.length > 0 && (
          <div className="space-y-4">
            <button
              onClick={() => {
                setTeacherStudents([]);
                setSelectedTeacher(null);
                setShowTeachers(true);
              }}
              className="bg-gray-300 hover:bg-gray-400 text-black font-semibold px-4 py-2 rounded"
            >
              🔙 Back to Teachers
            </button>
            <h3 className="text-yellow-300 text-lg font-semibold mb-2">
              Students assigned to the selected teacher:
            </h3>
            <table className="w-full table-auto border-collapse shadow text-sm sm:text-base">
              <thead className="bg-white/10 text-yellow-300">
                <tr>
                  <th className="p-3 border border-white/20">Name</th>
                  <th className="p-3 border border-white/20">Email</th>
                </tr>
              </thead>
              <tbody>
                {teacherStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-white/10 text-center transition">
                    <td className="p-3 border border-white/20">{s.name} {s.surname}</td>
                    <td className="p-3 border border-white/20">{s.email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
