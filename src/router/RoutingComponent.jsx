import { Route, Routes } from "react-router"
import Login from "../Login"
import AdminDashboard from "../admin/pages/AdminDashboard"
import StudentDashboard from "../student/pages/StudentDashboard"
import TeacherDashboard from "../teacher/pages/TeacherDashboard"
import Signup from "../student/pages/SignUp"
import { Dashboard } from "../Dashboard"
import NotAuthorized from "../NotOuthorized"
import ProtectedRoute from "./ProtectedRoute"
import EditReview from "../teacher/pages/EditReview"

export const RoutingComponent = () => {
    return (
        <Routes>
            <Route
                path="/"
                element={<Login />}
            />

            <Route
                path="/register"
                element={
                    <Signup />
                }
            />

            <Route
                path="/dashboard"
                element={
                    <Dashboard />
                }
            />

            <Route
                path="/admin"
                element={
                    <ProtectedRoute allowedRoles={["admin"]}>

                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/student"
                element={
                    <ProtectedRoute allowedRoles={["student"]}>
                        <StudentDashboard />
                    </ProtectedRoute>
                }
            />

            <Route
                path="/teacher"
                element={
                    <ProtectedRoute allowedRoles={["teacher"]}>
                        <TeacherDashboard />
                    </ProtectedRoute>
                }
            />

           <Route
      path="/editreview/:id"
      element={
        
            <EditReview />
    
      }
           />

            <Route
                path="/not-authorized"
                element={
                    <NotAuthorized />
                }
            />
        </Routes>
    )
}
