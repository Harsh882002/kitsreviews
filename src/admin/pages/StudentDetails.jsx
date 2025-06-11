import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import {
  User,
  Mail,
  Calendar,
  BookOpen,
  GraduationCap,
  MapPin,
  BadgeInfo,
} from 'lucide-react';

export default function StudentDetails() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchStudentAndTeacher = async () => {
      try {
        const db = getFirestore();

        // Fetch student data
        const studentDocRef = doc(db, 'users', id);
        const studentSnap = await getDoc(studentDocRef);

        if (studentSnap.exists()) {
          const studentData = { id: studentSnap.id, ...studentSnap.data() };
          setStudent(studentData);

          // Fetch teacher data
          if (studentData.teacherId) {
            const teacherDocRef = doc(db, 'users', studentData.teacherId);
 
            const teacherSnap = await getDoc(teacherDocRef);
             if (teacherSnap.exists()) {
              setTeacher(teacherSnap.data());
            }
          }
        } else {
          console.log('No such student!');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAndTeacher();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-950 text-white">
        Loading student details...
      </div>
    );

  if (!student)
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-950 text-red-400">
        Student not found.
      </div>
    );

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white relative">
      {/* Spinning Gradient Circle */}
      <div className="absolute top-1/2 left-1/2 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-600 rounded-full opacity-20 blur-3xl -translate-x-1/2 -translate-y-1/2 animate-spin-slow"></div>

      <div className="relative z-10 max-w-3xl mx-auto bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl sm:text-4xl font-bold text-yellow-300 text-center mb-6">
          🎓 Student Profile
        </h1>

        <div className="grid sm:grid-cols-2 gap-6 text-sm sm:text-base">
          <Info icon={<User size={18} />} label="Name" value={`${student.name} ${student.surname}`} />
          <Info icon={<Mail size={18} />} label="Email" value={student.email} />
          <Info icon={<Calendar size={18} />} label="Age" value={student.age} />
          <Info icon={<MapPin size={18} />} label="City" value={student.city} />
          <Info icon={<BookOpen size={18} />} label="Course" value={student.course} />
          <Info icon={<GraduationCap size={18} />} label="Education" value={student.education} />
          <Info icon={<BadgeInfo size={18} />} label="Role" value={student.role} />
          <Info icon={<BadgeInfo size={18} />} label="UID" value={student.uid} />
          <Info
            icon={<User size={18} />}
            label="Teacher"
            value={
               student.teacherId
            }
          />
          <Info
            icon={<Calendar size={18} />}
            label="Created At"
            value={
              student.createdAt?.seconds
                ? new Date(student.createdAt.seconds * 1000).toLocaleString()
                : 'N/A'
            }
          />
        </div>
      </div>

      {/* Custom spin animation */}
      <style>{`
        .animate-spin-slow {
          animation: spin 60s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg);}
          100% { transform: rotate(360deg);}
        }
      `}</style>
    </div>
  );
}

// Info Card Item Component
const Info = ({ icon, label, value }) => (
  <div className="flex items-start gap-3 p-4 bg-white/10 rounded-xl border border-white/10 shadow">
    <div className="text-yellow-300 mt-1">{icon}</div>
    <div>
      <p className="text-sm font-semibold text-yellow-200">{label}</p>
      <p className="text-white">{value || 'N/A'}</p>
    </div>
  </div>
);
