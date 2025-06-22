import { useState, useEffect } from "react";
import { collection, setDoc, doc, Timestamp, getDocs, getDoc, where, query } from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebaseConfig";
import { useNavigate } from "react-router";

export default function Signup() {
    const navigate = useNavigate();

    const [teachers, setTeachers] = useState([]);
    const [subjects, setSubjects] = useState([]);

    const [formData, setFormData] = useState({
        name: "",
        surname: "",
        age: "",
        course: "",
        city: "",
        education: "",
        email: "",
        password: "",
        teacherId: "",
    });

    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        const fetchTeachers = async () => {
            try {
                const q = query(collection(db, "users"), where("role", "==", "teacher"));
                const teachersSnapshot = await getDocs(q);
                const teachersList = teachersSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setTeachers(teachersList);
            } catch (error) {
                console.error("Error fetching teachers:", error);
            }
        };
        fetchTeachers();
    }, []);

    // Fetch subjects when a teacher is selected
    useEffect(() => {
        const fetchSubjects = async () => {
            if (!formData.teacherId) {
                setSubjects([]);
                return;
            }

            try {
                const teacherDoc = await getDoc(doc(db, 'users', formData.teacherId));
                if (teacherDoc.exists()) {
                    const data = teacherDoc.data();
                    setSubjects(data.courses || []);
                }
            } catch (error) {
                console.error("Error fetching subjects:", error);
            }
        };

        fetchSubjects();
    }, [formData.teacherId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
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
        if (!formData.teacherId) {
            setErrorMsg("Please select a teacher.");
            return false;
        }
        if (!formData.course) {
            setErrorMsg("Please select a subject.");
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
            const userCredential = await createUserWithEmailAndPassword(
                auth,
                formData.email,
                formData.password
            );
            const user = userCredential.user;

            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                name: formData.name,
                surname: formData.surname,
                age: formData.age,
                course: formData.course,
                city: formData.city,
                education: formData.education,
                email: formData.email,
                teacherId: formData.teacherId,
                role: "student",
                createdAt: Timestamp.now(),
            });

            alert("Student Registered Successfully!");
            setFormData({
                name: "",
                surname: "",
                age: "",
                course: "",
                city: "",
                education: "",
                email: "",
                password: "",
                teacherId: "",
            });
            setSubjects([]);

            navigate("/");
        } catch (error) {
            setErrorMsg(error.message);
        }

        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-r from-[#1f005c] via-[#5b0060] to-[#870160] animate-gradient-x">
            <div className="bg-black bg-opacity-70 backdrop-blur-lg rounded-3xl p-10 max-w-3xl w-full shadow-lg border border-[#FF00CC]">
                <h2 className="text-white font-extrabold text-center mb-10 tracking-wide text-3xl sm:text-4xl md:text-5xl leading-tight">
                    🎓 Student Registration
                </h2>

                <form
                    onSubmit={handleSubmit}
                    className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white"
                    autoComplete="off"
                >
                    <FloatingInput label="First Name" name="name" value={formData.name} onChange={handleChange} />
                    <FloatingInput label="Last Name" name="surname" value={formData.surname} onChange={handleChange} />
                    <FloatingInput label="Age" name="age" type="number" value={formData.age} onChange={handleChange} min="0" />
                    <FloatingInput label="City" name="city" value={formData.city} onChange={handleChange} />
                    <FloatingInput label="Education" name="education" value={formData.education} onChange={handleChange} />
                    <FloatingInput label="Email" name="email" type="email" value={formData.email} onChange={handleChange} className="md:col-span-2" />
                    <FloatingInput label="Password" name="password" type="password" value={formData.password} onChange={handleChange} className="md:col-span-2" />

                    {/* Select Teacher */}
                    <div className="relative md:col-span-2">
                        <label className="block mb-1 text-gray-400 text-sm select-none">
                            Select Teacher
                        </label>
                        <select
                            name="teacherId"
                            value={formData.teacherId}
                            onChange={handleChange}
                            required
                            className="w-full bg-black border border-gray-600 rounded-xl py-3 px-4 text-white  focus:outline-none focus:ring-2 focus:ring-[#FF00CC] focus:border-[#FF00CC] transition"
                        >
                            <option value="">-- Select Teacher --</option>
                            {teachers.map((teacher) => (
                                <option key={teacher.id} value={teacher.id}>
                                    {teacher.name} {teacher.surname}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Select Subject (Courses) */}
                    {subjects.length > 0 && (
                        <div className="relative md:col-span-2">
                            <label className="block mb-1 text-gray-400 text-sm select-none">
                                Select Subject
                            </label>
                            <select
                                name="course"
                                value={formData.course}
                                onChange={handleChange}
                                required
                                className="w-full bg-black border border-gray-600 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-[#FF00CC] focus:border-[#FF00CC] transition"
                            >
                                <option value="">-- Select Subject --</option>
                                {subjects.map((subject, index) => (
                                    <option key={index} value={subject}>
                                        {subject}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {errorMsg && (
                        <p className="md:col-span-2 text-red-400 text-center">{errorMsg}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="col-span-1 md:col-span-2 mt-6 bg-[#FF00CC] hover:bg-[#e600b8] transition-colors duration-300 rounded-xl py-3 font-semibold text-white shadow-[0_0_10px_#FF00CC] hover:shadow-[0_0_20px_#FF00CC] disabled:opacity-50"
                    >
                        {loading ? "Registering..." : "Register"}
                    </button>
                </form>

                <p className="text-center text-gray-300 mt-8 text-sm">
                    Already have an account?{" "}
                    <a href="/" className="underline text-[#FF00CC] hover:text-[#e600b8]">
                        Login here
                    </a>
                </p>
            </div>

            <style>{`
                @keyframes gradient-x {
                  0%, 100% {
                    background-position: 0% 50%;
                  }
                  50% {
                    background-position: 100% 50%;
                  }
                }
                .animate-gradient-x {
                  background-size: 200% 200%;
                  animation: gradient-x 8s ease infinite;
                }
            `}</style>
        </div>
    );
}

function FloatingInput({
    label,
    name,
    value,
    onChange,
    type = "text",
    className = "",
    autoComplete = "off",
    min,
}) {
    return (
        <div className={`relative ${className}`}>
            <input
                id={name}
                name={name}
                type={type}
                value={value}
                onChange={onChange}
                required
                placeholder=" "
                min={min}
                autoComplete={autoComplete}
                className="peer w-full bg-transparent border border-gray-600 rounded-xl py-4 px-4 text-white placeholder-transparent focus:outline-none focus:ring-2 focus:ring-[#FF00CC] focus:border-[#FF00CC] transition"
            />
            <label
                htmlFor={name}
                className="absolute left-4 top-4 text-gray-400 text-base transition-all select-none pointer-events-none"
            >
                {label}
            </label>
        </div>
    );
}
