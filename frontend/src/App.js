import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserVerification from './components/UserVerificationFrontend/UserVerification';
import EventInformation from './components/EventInformationFrontend/EventInformation';
import EventCarouselList from './components/EventCarouselFrontend/EventCarouselList';
import Login from './components/TixitoAdminLoginSignup/Login';
import Signup from './components/TixitoAdminLoginSignup/Signup';
import AdminPanel from './components/AdminPanelFrontend/AdminPanel';
import Profile from './components/ProfileFrontend/Profile';
import Layout from './components/NavbarFrontend/Layout';
import './App.css';

function App() {
  const apiUrl = process.env.REACT_APP_BACKEND_API_URL;
  console.log('Backend API URL:', apiUrl);

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/admin-panel" element={<Layout><AdminPanel /></Layout>} />
          <Route path="/event-information" element={<Layout><EventInformation /></Layout>} />
          <Route path="/event-carousel" element={<Layout><EventCarouselList /></Layout>} />
          <Route path="/user-verification" element={<Layout><UserVerification /></Layout>} />
          <Route path="/profile" element={<Layout><Profile /></Layout>} />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;
