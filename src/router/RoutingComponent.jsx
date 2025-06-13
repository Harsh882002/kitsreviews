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
import EditReviewForm from "../student/pages/EditReview"
import AllReviews from "../teacher/pages/AllReviews"
import ForgetPassword from "../ForgetPassword"
import StudentDetails from "../admin/pages/StudentDetails"
import UpdateStudentForm from "../student/pages/UpdateStudent"
import SendFeedBack from "../admin/pages/SendFeedBack"
import SendFeedBackEmail from "../admin/pages/SendFeedbackViaEmail"

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
                path="/edit-review/:topic"
                element={
                    <EditReviewForm />
                }
            />


            <Route
                path="/allreview/:teacherid"
                element={<AllReviews />}
            />


            <Route
                path="/forgot-password"
                element={
                    <ForgetPassword />
                }
            />

            <Route
                path="/studentdetails/:id"
                element={
                    <StudentDetails />
                }
            />

            <Route path="/student/update/:id"
                element={
                    <UpdateStudentForm />
                }
            />

            <Route
                path="/sendfeedback/:studentId"
                element={
                    <SendFeedBack />
                }
            />
            <Route
            path="/sendfeedback/email/:studentId"
            element={
                <SendFeedBackEmail />
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
