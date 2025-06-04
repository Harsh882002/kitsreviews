// components/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router";
 import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

export default function ProtectedRoute({ children, allowedRoles }) {
  const [role, setRole] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setRole(docSnap.data().role);
        }
      }
      setChecking(false);
    };

    checkRole();
  }, []);

  if (checking) return <div className="text-white">Checking permissions...</div>;

  if (!allowedRoles.includes(role)) {
    return <Navigate to="/not-authorized" />;
  }

  return children;
}
