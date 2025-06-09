import React, { useState } from 'react';
import { auth, db } from '../../firebaseConfig';
import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router';
import { createUserWithEmailAndPassword } from 'firebase/auth';

const TeacherForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    education: '',
    subject: '',
    email: '',
    password: '',
    phone: '',
    joiningDate: '',
  });

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMsg("");
  };

  const validateForm = () => {
    if (formData.password.length < 6) {
      setErrorMsg("Password should be at least 6 characters.");
      return false;
    }

    if (!formData.email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setErrorMsg("");

    try {
      // Step 1: Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email.trim(),
        formData.password.trim()
      );

      const user = userCredential.user;
      const teacherId = user.uid; // Use Firebase UID as teacherId

      // Step 2: Save teacher details in Firestore
      await setDoc(doc(db, "users", teacherId), {
        teacherId: teacherId,
        name: formData.name,
        surname: formData.surname,
        education: formData.education,
        subject: formData.subject,
        email: formData.email,
        phone: formData.phone,
        joiningDate: formData.joiningDate,
        role: "teacher",
        createdAt: Timestamp.now(),
      });

      alert("Teacher Registered Successfully!");
      setFormData({
        name: '',
        surname: '',
        education: '',
        subject: '',
        email: '',
        password: '',
        phone: '',
        joiningDate: '',
      });

      navigate("/dashboard");
    } catch (error) {
      setErrorMsg(error.message);
    }

    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/10 backdrop-blur-md p-6 rounded-2xl max-w-md w-full text-white border border-white/30 shadow-xl space-y-6"
    >
      <h2 className="text-2xl font-semibold text-yellow-300 text-center">Add Mentor</h2>

      {[
        { label: 'First Name', name: 'name', type: 'text' },
        { label: 'Surname', name: 'surname', type: 'text' },
        { label: 'Education', name: 'education', type: 'text' },
        { label: 'Subject Expertise', name: 'subject', type: 'text' },
        { label: 'Email', name: 'email', type: 'email' },
        { label: 'Password', name: 'password', type: 'password' },
        { label: 'Phone Number', name: 'phone', type: 'tel' },
        { label: 'Joining Date', name: 'joiningDate', type: 'date' },
      ].map((field) => (
        <div key={field.name}>
          <label className="block mb-1 text-yellow-300">{field.label}</label>
          <input
            type={field.type}
            name={field.name}
            value={formData[field.name]}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-transparent border border-yellow-300 text-yellow-100 placeholder-yellow-200 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            placeholder={field.label}
            required={field.name !== 'phone' && field.name !== 'joiningDate'}
          />
        </div>
      ))}

      {errorMsg && <p className="text-red-400 text-center">{errorMsg}</p>}

      <button
        type="submit"
        className="w-full bg-yellow-400 text-indigo-900 font-bold py-3 rounded-xl hover:bg-yellow-500 transition"
        disabled={loading}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

export default TeacherForm;
