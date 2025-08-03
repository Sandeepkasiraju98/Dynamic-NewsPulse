import React, { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";
import { motion, AnimatePresence } from "framer-motion";

export default function AuthForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (isSignup && password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      if (isSignup) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err) {
      setError(
        err.code === "auth/email-already-in-use"
          ? "Email already in use"
          : err.message || "Authentication failed"
      );
    }

    setLoading(false);
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      onLogin();
    } catch (err) {
      setError("Google sign-in failed");
    }
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email to reset password.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
    } catch (err) {
      setError("Failed to send password reset email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 px-4">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white bg-opacity-90 backdrop-blur-md rounded-xl shadow-lg p-10 max-w-md w-full"
      >
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 text-center">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>

        <label className="block mb-4">
          <span className="text-gray-700 font-medium">Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            autoComplete="email"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="you@example.com"
          />
        </label>

        <label className="block mb-4">
          <span className="text-gray-700 font-medium">Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            required
            autoComplete={isSignup ? "new-password" : "current-password"}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            placeholder="Your password"
          />
        </label>

        {isSignup && (
          <label className="block mb-4">
            <span className="text-gray-700 font-medium">Re-enter Password</span>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
              autoComplete="new-password"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="Confirm your password"
            />
          </label>
        )}

        <AnimatePresence>
          {(error || resetSent) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`mb-4 text-center font-semibold ${
                error ? "text-red-600" : "text-green-600"
              }`}
            >
              {resetSent ? "Reset email sent!" : error}
            </motion.div>
          )}
        </AnimatePresence>

        {!isSignup && (
          <div className="mb-4 text-right text-sm">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={loading}
              className="text-indigo-600 hover:underline"
            >
              Forgot password?
            </button>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white font-semibold 
            ${loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"} 
            transition-colors duration-300`}
        >
          <AnimatePresence>
            {loading ? (
              <motion.div
                key="spinner"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="mx-auto w-6 h-6 border-4 border-white border-t-transparent rounded-full"
              />
            ) : (
              <motion.span
                key="auth-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {isSignup ? "Sign Up" : "Log In"}
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <div className="mt-4 text-center text-sm text-gray-600">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
              setResetSent(false);
              setConfirmPassword("");
            }}
            className="text-indigo-600 hover:underline font-medium"
            disabled={loading}
          >
            {isSignup ? "Log In" : "Sign Up"}
          </button>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-3 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors duration-300"
          >
            Continue with Google
          </button>
        </div>
      </motion.form>
    </div>
  );
}
