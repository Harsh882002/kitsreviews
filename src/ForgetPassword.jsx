import { sendPasswordResetEmail } from 'firebase/auth';
import React, { useState } from 'react'
import { toast, ToastContainer } from 'react-toastify';
import { auth } from './firebaseConfig';

const ForgetPassword = () => {
    const [email, setEmail] = useState("");

    const handlePasswordReset = async (e) => {
        e.preventDefault();

        try {
            await sendPasswordResetEmail(auth, email.trim());
            toast.success("If an account exists with this email, a reset link has been sent.");
        } catch (error) {
            console.log(error);
            toast.error(error.message || "Failed to send password reset email.");
        }
    };
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <form onSubmit={handlePasswordReset} className="bg-white p-6 rounded shadow-md w-96">
                <h2 className="text-2xl font-semibold mb-4 text-center">Forgot Password</h2>

                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 border rounded mb-4"
                />

                <button
                    type="submit"
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                >
                    Send Reset Link
                </button>

            </form>
            <ToastContainer position="top-center" autoClose={3000} />

        </div>
    );
}

export default ForgetPassword
