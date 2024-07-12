import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5001/login', { email, password });
      if (response.status === 200) {
        // Fetch admin details after successful login
        const adminDetailsResponse = await axios.get(`http://localhost:5001/admin-details?email=${email}`);
        if (adminDetailsResponse.status === 200) {
          // Store admin details in localStorage for later use in Navbar
          const adminEmail = adminDetailsResponse.data.email;
          localStorage.setItem('adminEmail', adminEmail);
        }
        navigate('/admin-panel');
      }
    } catch (error) {
      toast.error('Invalid credentials');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.5 }}
      className="login-container"
    >
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <motion.button
          type="submit"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          Login
        </motion.button>
      </form>
      <p>
        New to admin panel? <a href="/signup">Create Admin</a>
      </p>
    </motion.div>
  );
}

export default Login;
