import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { toast } from 'react-toastify';

export default function UpdateStudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allTeachers, setAllTeachers] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const studentRef = doc(db, 'users', id);
        const studentSnap = await getDoc(studentRef);

        if (!studentSnap.exists()) {
          toast.error("Student not found.");
          return navigate('/');
        }

        const studentData = studentSnap.data();

        // Convert course from string to array if needed
        const formattedCourse = Array.isArray(studentData.course)
          ? studentData.course
          : studentData.course
          ? studentData.course.split(',').map((c) => c.trim())
          : [];

        const initialTeachers = studentData.teacherId || [];

        setStudent({ ...studentData, course: formattedCourse, teacherId: initialTeachers });

        const usersSnap = await getDocs(collection(db, 'users'));
        const teacherUsers = usersSnap.docs
          .filter(doc => doc.data().role === 'teacher')
          .map(doc => ({ id: doc.id, ...doc.data() }));

        setAllTeachers(teacherUsers);
  

        const available = teacherUsers.filter(t => !initialTeachers.includes(t.id));
        setAvailableTeachers(available);

        setLoading(false);
      } catch (err) {
        console.error(err);
        toast.error("Error loading data.");
        setLoading(false);
      }
    };

    fetchData();
  }, [id, navigate]);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'users', id), {
        name: student.name,
        surname: student.surname,
        email: student.email,
        age: student.age,
        city: student.city,
        course: student.course || [],
        education: student.education,
        phone: student.phone,
        parentEmail: student.parentEmail,
        teacherId: student.teacherId || [],
      });

      toast.success("Profile updated!");
      navigate('/dashboard');
    } catch (err) {
      toast.error("Update failed: " + err.message);
    }
  };

  const handleAddTeacher = () => {
    if (!selectedTeacher || (student.teacherId || []).includes(selectedTeacher)) return;

    const selected = allTeachers.find(t => t.id === selectedTeacher);
    if (!selected) return toast.error("Teacher not found");

    setStudent(prev => ({
      ...prev,
      teacherId: [...(prev.teacherId || []), selectedTeacher],
     }));

    setAvailableTeachers(prev => prev.filter(t => t.id !== selectedTeacher));
    setSelectedTeacher('');
  };

  const handleRemoveTeacher = (teacherId) => {
    const updatedTeachers = student.teacherId.filter(tid => tid !== teacherId);
    const removedTeacher = allTeachers.find(t => t.id === teacherId);

    setStudent({ ...student, teacherId: updatedTeachers });
    setAvailableTeachers(prev => [...prev, removedTeacher]);
  };

  const handleAddCourse = () => {
    if (!selectedCourse.trim()) return;
    if (student.course.includes(selectedCourse.trim())) return toast.warn("Course already added");

    setStudent((prev) => ({
      ...prev,
      course: [...prev.course, selectedCourse.trim()],
    }));
    setSelectedCourse('');
  };

  const handleRemoveCourse = (courseName) => {
    setStudent((prev) => ({
      ...prev,
      course: prev.course.filter(c => c !== courseName),
    }));
  };

  if (loading) return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex justify-center items-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 p-8 rounded-xl border border-white/20 w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-yellow-400 text-center">Update Student Profile</h2>

        {['name', 'surname', 'email', 'age', 'city', 'education'].map((field) => (
          <div className="mb-4" key={field}>
            <label className="block mb-1 capitalize">{field}</label>
            <input
              type="text"
              name={field}
              value={student[field] || ''}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white/20 border border-white/30 text-white"
              required
            />
          </div>
        ))}

        <div className="mb-4">
          <label className="block mb-1">Parent's Phone Number</label>
          <input
            type="text"
            name="phone"
            value={student.phone || ''}
            onChange={handleChange}
            className="w-full p-2 rounded bg-white/20 border border-white/30 text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Parent's Email</label>
          <input
            type="email"
            name="parentEmail"
            value={student.parentEmail || ''}
            onChange={handleChange}
            className="w-full p-2 rounded bg-white/20 border border-white/30 text-white"
            required
          />
        </div>

        {/* Course (as multiple) */}
        <div className="mb-4">
          <label className="block mb-1">Add Course</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full p-2 rounded bg-white/20 border border-white/30 text-white"
            />
            <button
              type="button"
              onClick={handleAddCourse}
              className="bg-blue-500 px-4 rounded hover:bg-blue-600 text-black"
            >
              Add
            </button>
          </div>
          <ul className="mt-2">
            {student.course?.map((c, idx) => (
              <li
                key={idx}
                className="bg-white/20 rounded px-2 py-1 my-1 flex justify-between items-center"
              >
                <span>{c}</span>
                <button
                  onClick={() => handleRemoveCourse(c)}
                  className="text-red-400 hover:text-red-600"
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Assigned Teachers */}
        <div className="mb-4">
          <label className="block mb-2 font-semibold text-yellow-400">Assigned Teachers</label>
          <ul className="mb-2">
            {student.teacherId.map((teacherId, index) => {
              const teacher = allTeachers.find(t => t.id === teacherId);
              return (
                <li
                  key={index}
                  className="flex justify-between items-center bg-white/20 p-2 rounded mb-1"
                >
                  <span>{teacher?.name || "Unknown"} {teacher?.surname || ""}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTeacher(teacherId)}
                    className="text-red-400 hover:text-red-600 text-lg font-bold"
                    title="Remove"
                  >
                    ❌
                  </button>
                </li>
              );
            })}
          </ul>

          {availableTeachers.length > 0 ? (
            <div className="flex gap-2 items-center">
              <select
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="flex-1 p-2 rounded bg-black border border-green/30 text-white"
              >
                <option value="">-- Select Teacher --</option>
                {availableTeachers.map(t => (
                  <option key={t.id} value={t.id}>{t.name} {t.surname}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddTeacher}
                className="bg-green-500 px-4 py-2 rounded text-black hover:bg-green-600"
              >
                Add
              </button>
            </div>
          ) : (
            <p className="text-sm text-gray-300 mt-2">No more teachers to add.</p>
          )}
        </div>

        <div className="text-center mt-6">
          <button
            type="submit"
            className="bg-yellow-500 text-black px-6 py-2 rounded hover:bg-yellow-600 transition"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
