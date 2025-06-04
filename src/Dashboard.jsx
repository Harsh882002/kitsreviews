import { useNavigate } from "react-router";
import StudentDashboard from "./student/pages/StudentDashboard";
import AdminDashboard from "./admin/pages/AdminDashboard";
import TeacherDashboard from "./teacher/pages/TeacherDashboard";
import { useEffect, useState } from "react";
import { auth, db } from "./firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

export const Dashboard = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState(localStorage.getItem("role")); // preload role
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const data = userSnap.data();
            const userRole = data.role?.toLowerCase();

            if (!userRole) throw new Error("Role Not Found");

            setRole(userRole);
            localStorage.setItem("role", userRole);
          } else {
            throw new Error("User document not found");
          }
        } catch (error) {
          console.error("Role fetch error:", error);
          navigate("/", { replace: true });
        } finally {
          setLoading(false);
        }
      } else {
        // Not logged in
        localStorage.removeItem("role");
        navigate("/", { replace: true });
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // 🚀 Handle browser back button
  useEffect(() => {
    const handleBack = () => {
      const savedRole = localStorage.getItem("role");
      if (savedRole === "student") {
        navigate("/dashboard", { replace: true });
      } else if (savedRole === "admin") {
        navigate("/dashboard", { replace: true });
      } else if (savedRole === "teacher") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    };

    window.addEventListener("popstate", handleBack);
    return () => window.removeEventListener("popstate", handleBack);
  }, [navigate]);

  if (loading || !role) {
    return <div className="text-center mt-10 text-lg">Loading dashboard...</div>;
  }

  // 🔁 Conditional dashboard rendering
  switch (role) {
    case "student":
      return <StudentDashboard />;
    case "admin":
      return <AdminDashboard />;
    case "teacher":
      return <TeacherDashboard />;
    default:
      return <h1 className="text-center mt-10 text-red-600">Invalid User Role</h1>;
  }
};
