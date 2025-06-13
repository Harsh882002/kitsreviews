import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { toast } from 'react-toastify';

export default function UpdateStudentForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudent = async () => {
      const docRef = doc(db, 'users', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setStudent(snap.data());
      } else {
        toast.error("Student not found.");
        navigate('/');
      }
      setLoading(false);
    };
    fetchStudent();
  }, [id, navigate]);

  const handleChange = (e) => {
    setStudent({ ...student, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateDoc(doc(db, 'users', id), student);
      toast.success("Profile updated!");
      navigate('/dashboard');
    } catch (err) {
      toast.error("Update failed.");
    }
  };

  if (loading) return <div className="text-white text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 text-white flex justify-center items-center px-4 py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 p-8 rounded-xl border border-white/20 w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold mb-6 text-yellow-400 text-center">Update Student Profile</h2>

        {['name', 'surname', 'email', 'age', 'city', 'course', 'education'].map((field) => (
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

        {/* New field: Parent's Phone */}
        <div className="mb-4">
          <label className="block mb-1">Parent's Phone Number</label>
          <input
            type="text"
            name="phone"
            value={student.phone || ''}
            onChange={handleChange}
            placeholder="10-digit mobile number"
            className="w-full p-2 rounded bg-white/20 border border-white/30 text-white"
            required
          />
        </div>

        {/* New field: Parent's Email */}
        <div className="mb-4">
          <label className="block mb-1">Parent's Email</label>
          <input
            type="email"
            name="parentEmail"
            value={student.parentEmail || ''}
            onChange={handleChange}
            placeholder="example@email.com"
            className="w-full p-2 rounded bg-white/20 border border-white/30 text-white"
            required
          />
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
