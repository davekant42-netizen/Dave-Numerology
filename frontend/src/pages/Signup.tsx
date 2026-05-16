import React, { useState, useContext } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

const Signup = () => {
  const[name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const[error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/signup`, { name, email, password });
      login(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="bg-card border border-border p-8 rounded-lg shadow-sm w-full max-w-md">
        <h2 className="text-2xl font-bold text-primary mb-6 text-center">Create an Account</h2>
        {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Name</label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted-foreground mb-1">Password</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-background border border-border rounded px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="w-full bg-primary text-primary-foreground font-semibold py-2 px-4 rounded hover:opacity-90 transition-opacity">Sign Up</button>
        </form>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account? <Link to="/login" className="text-primary hover:underline">Login</Link>
        </p>
      </div>
      <div className="fixed bottom-4 right-4 bg-card/80 backdrop-blur-sm border border-border p-3 rounded-lg shadow-sm text-xs text-muted-foreground z-50">
        Developed by Krishnakant Dave and Aditya Gandhi
      </div>
    </div>
  );
};

export default Signup;