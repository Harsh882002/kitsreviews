import { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { getAuth, signOut } from 'firebase/auth';
import {
  doc,
  getDoc,
  getDocs,
  collection,
  query,
  where
} from 'firebase/firestore';
import { ToastContainer, toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router';
import 'react-toastify/dist/ReactToastify.css';

import ProfileCard from './ProfileCard';
import ReviewsSection from './ReviewsSection';

export default function StudentDashboard() {
  const [student, setStudent] = useState(null);
  const [teacher, setTeacher] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [submittedTopics, setSubmittedTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();


  console.log(reviews)
  useEffect(() => {
    async function fetchData() {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        const studentDoc = await getDoc(doc(db, 'users', user.uid));
        if (!studentDoc.exists()) throw new Error('Student not found');

        const studentData = studentDoc.data();
        setStudent({ ...studentData, uid: user.uid });

        const allReviews = [];
        const teacherDataList = [];

        if (Array.isArray(studentData.teacherId)) {
          for (let i = 0; i < studentData.teacherId.length; i++) {
            const teacherId = studentData.teacherId[i];
            const subject = Array.isArray(studentData.course)
              ? studentData.course[i]
              : studentData.course;

            const teacherDoc = await getDoc(doc(db, 'users', teacherId));
            let teacherName = 'Unknown';
            if (teacherDoc.exists()) {
              const tData = teacherDoc.data();
              teacherDataList.push(tData);
              teacherName = `${tData.name} ${tData.surname}`;
            }

            const reviewsQuery = query(
              collection(db, 'reviews'),
              where('teacherId', '==', teacherId),
              where('subject', '==', subject)
            );

            const reviewsSnapshot = await getDocs(reviewsQuery);
             const reviewsList = reviewsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              date: doc.data().date?.toDate?.() || new Date(doc.data().date),
              teacherName,
              subject
            }));

            allReviews.push(...reviewsList);
          }
        }

        allReviews.sort((a, b) => b.date - a.date);
        setReviews(allReviews);
        setTeacher(teacherDataList);
      } catch (err) {
        toast.error(err.message || 'Error loading data.');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchSubmittedReviews() {
      if (!Array.isArray(student?.teacherId) || !student?.uid) return;
      let allTopics = [];

      for (let teacherId of student.teacherId) {
        const q = query(
          collection(db, 'studentreviews'),
          where('teacherId', '==', teacherId),
          where('studentId', '==', student.uid)
        );
        const snapshot = await getDocs(q);
        const topics = snapshot.docs.map(doc => doc.data().topic?.toLowerCase?.() || '');
        allTopics.push(...topics);
      }

      // ✅ Remove duplicates
      const uniqueTopics = [...new Set(allTopics)];
      setSubmittedTopics(uniqueTopics);
    }

    if (student) fetchSubmittedReviews();
  }, [student]);

  const handleLogout = async () => {
    try {
      const auth = getAuth();
      await signOut(auth);
      localStorage.clear();
      toast.success('Logged out successfully!');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="w-16 h-16 border-4 border-white border-dashed rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!student) return <div className="text-red-400">Student not found.</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white py-10 px-4">
      <h1 className="text-3xl sm:text-4xl font-extrabold mb-8 text-center drop-shadow-lg">
        Welcome, <span className="text-yellow-400">{student.name} {student.surname}</span>! 🎓
      </h1>

      <div className="flex justify-center mb-10 px-4">
        <div className="w-full max-w-3xl">
          <ProfileCard student={student} />
        </div>
      </div>

      <div className="flex justify-center px-4 ">
        <div className="w-full max-w-2xl">
          <ReviewsSection
            reviews={reviews}
            student={student}
            submittedTopics={submittedTopics}
            setSubmittedTopics={setSubmittedTopics}
          />
        </div>
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={handleLogout}
          className="bg-red-600 py-2 px-6 rounded-xl hover:bg-red-700 transition"
        >
          Logout
        </button>

        <button
          onClick={() => navigate(`/student/update/${student.uid}`)}
          className="ml-10 bg-yellow-500 py-2 px-6 rounded-xl hover:bg-yellow-600 transition text-black font-semibold"
        >
          Update Profile
        </button>
      </div>

      <ToastContainer position="top-center" autoClose={3000} theme="dark" />
    </div>
  );
}
