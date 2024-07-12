// Layout.js
import React from 'react';
import Navbar from './Navbar';
import { ToastContainer } from 'react-toastify'; // Importing ToastContainer to show notifications
import 'react-toastify/dist/ReactToastify.css'; // Importing CSS for toast notifications

const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      <ToastContainer /> {/* Include ToastContainer for notifications */}
      {children} {/* Render children components (e.g., routes) */}
    </div>
  );
};

export default Layout;
