import React, { useState } from 'react';
import axios from 'axios';

const API_URL = `${import.meta.env.VITE_API_URL}/api/auth`;

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isRegistering) {
        await axios.post(`${API_URL}/register`, { email, password });
        alert('Registration successful! Please log in.');
        setIsRegistering(false);
      } else {
        const res = await axios.post(`${API_URL}/login`, { email, password });
        onLogin(res.data.token,res.data.role);
      }
    } catch (err) {
      setError('Invalid credentials or server error.');
    }
  };

  return (
    <div>
        <div className="flex items-center justify-center h-screen">
        
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 rounded-lg shadow-md">

        <h2 className="text-2xl font-bold text-center">{isRegistering ? 'Register' : 'Login'}</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required className="w-full px-4 py-2 text-gray-900 bg-gray-200 rounded-md focus:outline-none"/>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required className="w-full px-4 py-2 text-gray-900 bg-gray-200 rounded-md focus:outline-none"/>
          {error && <p className="text-red-500">{error}</p>}
          <button type="submit" className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700">{isRegistering ? 'Register' : 'Login'}</button>
        </form>
        <p className="text-center">
          <button onClick={() => setIsRegistering(!isRegistering)} className="text-blue-400 hover:underline">
            {isRegistering ? 'Already have an account? Login' : "Don't have an account? Register"}
          </button>
        </p>
         <div className="relative flex py-2 items-center">
      <div className="flex-grow border-t border-gray-600"></div>
      <span className="flex-shrink mx-4 text-gray-400">OR</span>
      <div className="flex-grow border-t border-gray-600"></div>
  </div>

  <a 
    href="http://localhost:3001/api/auth/google" 
    className="w-full flex items-center justify-center px-4 py-2 font-bold text-white bg-red-600 rounded-md hover:bg-red-700"
  >
    Login with Google
  </a>
      </div>
      
    </div>
    </div>
    
  );
};

export default LoginPage;