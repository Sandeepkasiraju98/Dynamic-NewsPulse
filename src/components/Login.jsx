import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isNewUser, setIsNewUser] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isNewUser) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onLogin();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 border rounded-lg shadow-lg mt-20 bg-white">
      <h2 className="text-2xl font-bold mb-6 text-center">{isNewUser ? 'Sign Up' : 'Login'}</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        <input
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-600 text-center">{error}</p>}
        <button
          className="bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 transition"
          type="submit"
        >
          {isNewUser ? 'Sign Up' : 'Login'}
        </button>
      </form>
      <p className="mt-6 text-center text-gray-700">
        {isNewUser ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          className="text-blue-600 hover:underline"
          onClick={() => setIsNewUser(!isNewUser)}
        >
          {isNewUser ? 'Login here' : 'Sign up here'}
        </button>
      </p>
    </div>
  );
}

export default Login;
