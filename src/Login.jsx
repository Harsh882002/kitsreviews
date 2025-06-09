import {
  signInWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from './firebaseConfig';
import { Link, useNavigate } from 'react-router';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email.');
      return;
    }

    setLoading(true);

    try {
      await setPersistence(auth, browserLocalPersistence);

      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password.trim()
      );

      const user = userCredential.user;
      const token = await user.getIdToken();

      localStorage.setItem('token', token);
      localStorage.setItem('email', user.email);

      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        toast.error('User not found. Please register first.');
      } else if (err.code === 'auth/wrong-password') {
        toast.error('Incorrect password. Please try again.');
      } else {
        toast.error('Incorrect email or password. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen items-center justify-center bg-gradient-to-br from-purple-700 via-pink-600 to-red-500 animate-gradient-x px-4">
      {/* 3D Animation */}
      <div className="flex items-center justify-center w-full md:w-[40%] mb-6 md:mb-0 md:mr-[-20px]">
        <div className="relative w-36 h-36 sm:w-52 sm:h-52 [perspective:1000px]">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-md rounded-2xl border border-white/40 shadow-[0_0_30px_rgba(255,255,255,0.3)] flex items-center justify-center animate-spin3d transform-style-preserve-3d text-4xl sm:text-6xl font-bold text-white">
            <img
              src="kits_logo.jpg"
              className="w-28 h-28 sm:w-42 sm:h-42 rounded-2xl object-cover"
              alt="logo"
            />
          </div>
        </div>
      </div>

      {/* Login Form */}
      <div className="w-full md:w-[60%] flex items-center justify-center">
        <div className="backdrop-blur-lg bg-white/80 p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-sm sm:max-w-md border border-white/30 text-black relative">
          <div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-br from-white/20 to-transparent blur-xl opacity-20 pointer-events-none z-0"></div>
          <h2 className="text-4xl font-extrabold text-center drop-shadow-lg z-10 relative">
            🎓 User Login
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5 mt-6 z-10 relative">
            <div>
              <label className="block text-sm font-medium text-black">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 mt-1 bg-white border border-black/30 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-black placeholder:text-black/50"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 mt-1 bg-white border border-black/30 text-black rounded-xl focus:outline-none focus:ring-2 focus:ring-black placeholder:text-black/50"
                placeholder="Enter your password"
              />
              <div className="text-right mt-2">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-700 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 px-4 font-semibold rounded-xl border border-black shadow-md transition-all duration-300 ${
                loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-black text-white hover:bg-gray-800'
              }`}
            >
              {loading ? 'Logging in...' : '🔐 Login Now'}
            </button>
          </form>

          <p className="text-center text-sm text-black mt-5 z-10 relative">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-blue-700 hover:underline">
              Register
            </Link>
          </p>
        </div>
      </div>

      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

      <style jsx>{`
        .animate-gradient-x {
          background-size: 400% 400%;
          animation: gradientBG 15s ease infinite;
        }

        @keyframes gradientBG {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }

        .animate-spin3d {
          animation: spin3d 12s linear infinite;
        }

        @keyframes spin3d {
          0% {
            transform: rotateY(0deg) rotateX(0deg);
          }
          50% {
            transform: rotateY(180deg) rotateX(20deg);
          }
          100% {
            transform: rotateY(360deg) rotateX(0deg);
          }
        }
      `}</style>
    </div>
  );
}
