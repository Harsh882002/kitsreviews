import React, { useState, useEffect } from 'react';
import { db } from '../../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router';

const UpdateTeacherDetails = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    education: '',
    subject: '',
    email: '',
    phone: '',
    joiningDate: '',
    courses: [''],
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const fetchTeacherData = async () => {
      try {
        const docRef = doc(db, "users", teacherId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFormData({
            ...data,
            courses: Array.isArray(data.courses) ? data.courses : [data.course || ''],
          });
        } else {
          setErrorMsg("Teacher not found.");
        }
      } catch (error) {
        setErrorMsg("Error fetching teacher data.");
      }
    };

    fetchTeacherData();
  }, [teacherId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMsg("");
  };

  const handleCourseChange = (index, value) => {
    const updatedCourses = [...formData.courses];
    updatedCourses[index] = value;
    setFormData({ ...formData, courses: updatedCourses });
  };

  const addCourseField = () => {
    setFormData({ ...formData, courses: [...formData.courses, ''] });
  };

  const removeCourseField = (index) => {
    const updatedCourses = formData.courses.filter((_, i) => i !== index);
    setFormData({ ...formData, courses: updatedCourses });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const docRef = doc(db, "users", teacherId);
      await updateDoc(docRef, {
        ...formData,
        courses: formData.courses.filter(c => c.trim() !== ''),
      });

      alert("Teacher details updated successfully!");
      navigate("/dashboard");
    } catch (error) {
      setErrorMsg("Update failed. Try again.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-800 to-indigo-900 flex justify-center items-center p-6">
      <form
        onSubmit={handleSubmit}
        className="bg-white/10 backdrop-blur-md p-8 rounded-2xl max-w-2xl w-full text-white border border-white/30 shadow-2xl space-y-6"
      >
        <h2 className="text-3xl font-bold text-yellow-300 text-center mb-4">Update Mentor Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { label: 'First Name', name: 'name', type: 'text' },
            { label: 'Surname', name: 'surname', type: 'text' },
            { label: 'Education', name: 'education', type: 'text' },
            { label: 'Subject Expertise', name: 'subject', type: 'text' },
            { label: 'Email', name: 'email', type: 'email' },
            { label: 'Phone Number', name: 'phone', type: 'tel' },
            { label: 'Joining Date', name: 'joiningDate', type: 'date' },
          ].map((field) => (
            <div key={field.name}>
              <label className="block mb-1 text-yellow-200">{field.label}</label>
              <input
                type={field.type}
                name={field.name}
                value={formData[field.name]}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-white/5 border border-yellow-400 text-yellow-100 placeholder-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder={field.label}
                required={field.name !== 'phone'}
              />
            </div>
          ))}
        </div>

        <div>
          <label className="block mb-2 text-yellow-200 text-lg">Courses</label>
          {formData.courses.map((course, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                value={course}
                onChange={(e) => handleCourseChange(index, e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-yellow-400 text-yellow-100 placeholder-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                placeholder={`Course ${index + 1}`}
              />
              {formData.courses.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeCourseField(index)}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addCourseField}
            className="mt-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            + Add Course
          </button>
        </div>

        {errorMsg && <p className="text-red-400 text-center">{errorMsg}</p>}

        <button
          type="submit"
          className="w-full bg-yellow-400 text-indigo-900 font-bold py-3 rounded-xl hover:bg-yellow-500 transition"
          disabled={loading}
        >
          {loading ? "Updating..." : "Update Details"}
        </button>
      </form>
    </div>
  );
};

export default UpdateTeacherDetails;
